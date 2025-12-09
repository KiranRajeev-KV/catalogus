// backend/src/controllers/watchlist.controller.ts
import type { Request, Response } from "express";
import z from "zod";
import { prisma } from "../db/client.js";
import {
	AddWatchlistSchema,
	GetWatchlistSchema,
	UpdateWatchlistSchema,
} from "../schemas/watchlist.schema.js";
import {
	getTMDBMovieDetails,
	getTMDBTVDetails,
} from "../services/tmdb.service.js";
import { ApiSource } from "../generated/prisma/enums.js";

// /watchlist?page=1&limit=10&status=PLANNING&type=MOVIE&sort=latest&q=title
export const getWatchlist = async (req: Request, res: Response) => {
	console.log("Received GET /watchlist request with query:", req.query);
	// check if user is authenticated
	const userId = req.user?.id;
	if (!userId) {
		console.log("Error 401: Unauthorized access to watchlist");
		return res.status(401).json({ error: "Unauthorized" });
	}

	// validate query parameters
	const result = GetWatchlistSchema.safeParse(req.query);
	if (!result.success) {
		console.log("Error 400: Invalid query parameters", result.error);
		return res.status(400).json({
			error: "Invalid query parameters",
			details: z.treeifyError(result.error),
		});
	}

	const { page, limit, status, type, sort, q } = result.data;

	// pagination calculation
	const skip = (page - 1) * limit;
	const sortMapping: Record<string, any> = {
		latest: { updatedAt: "desc" },
		oldest: { updatedAt: "asc" },
		score_high: { rating: "desc" },
		score_low: { rating: "asc" },
		// Sorting by the Relation (Joined Table)
		title_az: { mediaItem: { title: "asc" } },
		title_za: { mediaItem: { title: "desc" } },
	};

	const orderBy = sortMapping[sort] || { updatedAt: "desc" };

	const mediaItemFilter: any = {
		// If type or q is provided, add filters for the mediaItem relation
		...(type && { type: type }),

		// If q (search query) is provided, add a title contains filter
		...(q && { title: { contains: q, mode: "insensitive" } }),
	};

	// filter object to be used as WHERE clause
	const whereClause = {
		userId: userId,

		// If status is provided, add it to the filter
		...(status && { status }),

		// If type or q is provided, filter inside the RELATION
		...(type || q ? { mediaItem: mediaItemFilter } : {}),
	};

	try {
		// 2 queries needed: one for data, one for total count
		// query 1: Get the actual data
		const watchlist = await prisma.wishlist.findMany({
			where: whereClause,
			skip: skip,
			take: limit,
			orderBy: orderBy,
			include: { mediaItem: true },
		});

		// query 2: Get total count (for frontend pagination UI)
		const totalCount = await prisma.wishlist.count({
			where: whereClause,
		});

		res.json({
			data: watchlist,
			pagination: {
				total: totalCount,
				page: page,
				limit: limit,
				totalPages: Math.ceil(totalCount / limit),
			},
		});
	} catch (error) {
		console.error("Error 500: Internal server error", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

// POST /watchlist
export const addToWatchlist = async (req: Request, res: Response) => {
	// check if user is authenticated
	const userId = req.user?.id;
	if (!userId) {
		console.log("Error 401: Unauthorized access to add watchlist item");
		return res.status(401).json({ error: "Unauthorized" });
	}

	// apiId,status,rating,comments
	const result = AddWatchlistSchema.safeParse(req.body);
	if (!result.success) {
		console.log("Error 400: Invalid request body", result.error);
		return res.status(400).json({
			error: "Invalid request body",
			details: z.treeifyError(result.error),
		});
	}

	const { apiId, type, status, rating, comments } = result.data;

	try {
		// we need to do multiple steps here:
		// 1.check if item already exists in watchlist
		// 2.fetch media item details from external API
		// 3.create or connect the media item in MediaItem table
		// 4.create the watchlist entry

		// 1. check if the item already exists in the user's watchlist
		const existingItem = await prisma.wishlist.findFirst({
			where: {
				userId: userId,
				mediaItem: {
					apiId: apiId,
					type: type,
				},
			},
		});

		if (existingItem) {
			console.log("Error 409: Item already exists in watchlist");
			return res
				.status(409)
				.json({ error: "Item already exists in watchlist" });
		}

		const apiSource = type === "ANIME" ? ApiSource.ANILIST : ApiSource.TMDB;

		const existingMedia = await prisma.mediaItem.findUnique({
			where: {
				apiSource_apiId: { apiId: apiId, apiSource: apiSource },
			},
		});

		let mediaItemId;

		const isStale = existingMedia
			? new Date().getTime() - existingMedia.updatedAt.getTime() >
				7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
			: true;

		if (existingMedia && !isStale) {
			// CASE A: We have it, and it's fresh.
			// SKIP THE EXTERNAL API CALL COMPLETELY.
			console.log("Using cached fresh metadata from DB");
			mediaItemId = existingMedia.itemId;
		} else {
			// CASE B: It's missing OR it's old.
			// Fetch from TMDB and update/create the central record.
			console.log("Fetching fresh metadata from TMDB");

			// 2. fetch media item details from external API
			// movie & tv calls TMDB, anime calls Anilist
			let details: any;
			switch (type) {
				case "MOVIE": {
					details = await getTMDBMovieDetails(apiId);
					break;
				}
				case "TV": {
					details = await getTMDBTVDetails(apiId);
					break;
				}
				case "ANIME": {
					// TODO: implement Anilist service
					console.log("Error 501: Anime support not implemented yet");
					return res.status(501).json({ error: "Anime support coming soon" });
				}
			}

			if (!details) {
				console.log("Error 500: Failed to fetch media item details");
				return res
					.status(500)
					.json({ error: "Failed to fetch media item details" });
			}

			const updatedMedia = await prisma.mediaItem.upsert({
				where: {
					apiSource_apiId: { apiId: apiId, apiSource: apiSource },
				},
				update: {
					metadata: details.metadata, // Update for everyone!
					// Prisma automatically updates 'updatedAt'
				},
				create: details,
			});
			mediaItemId = updatedMedia.itemId;
		}

		// 4. create the watchlist entry
		const watchlistEntry = await prisma.wishlist.create({
			data: {
				userId: userId,
				mediaItemId: mediaItemId,
				status: status,
				rating: rating,
				comments: comments,
			},
			include: { mediaItem: true },
		});

		console.log("Status 201: Watchlist item added successfully");
		res.status(201).json(watchlistEntry);
	} catch (error) {
		console.error("Error 500: Internal server error", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const updateWatchlistItem = async (req: Request, res: Response) => {
	console.log("Received PATCH /watchlist/:id request with body:", req.body);
	// check if user is authenticated
	const userId = req.user?.id;
	if (!userId) {
		console.log("Error 401: Unauthorized access to update watchlist item");
		return res.status(401).json({ error: "Unauthorized" });
	}

	const watchlistItemId = req.params.id;
	if (!watchlistItemId) {
		console.log("Error 400: Invalid watchlist item ID");
		return res.status(400).json({ error: "Invalid watchlist item ID" });
	}

	const result = UpdateWatchlistSchema.safeParse(req.body);
	if (!result.success) {
		console.log("Error 400: Invalid request body", result.error);
		return res.status(400).json({
			error: "Invalid request body",
			details: z.treeifyError(result.error),
		});
	}

	const { status, rating, comments } = result.data;

	try {
		// update the watchlist item
		const updatedItem = await prisma.wishlist.update({
			where: {
				wishlistId: watchlistItemId,
				userId: userId,
			},
			data: {
				...(status !== undefined && { status }),
				...(rating !== undefined && { rating }),
				...(comments !== undefined && { comments }),
			},
		});
		console.log("Status 200: Watchlist item updated successfully");
		res.status(200).json(updatedItem);
	} catch (error) {
		console.error("Error 500: Internal server error", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

// DELETE /watchlist/:id
export const deleteWatchlistItem = async (req: Request, res: Response) => {
	const userId = req.user?.id;
	if (!userId) {
		console.log("Error 401: Unauthorized access to delete watchlist item");
		return res.status(401).json({ error: "Unauthorized" });
	}

	const watchlistItemId = req.params.id;
	if (!watchlistItemId) {
		return res.status(400).json({ error: "Invalid watchlist item ID" });
	}

	try {
		const deletedItem = await prisma.wishlist.deleteMany({
			where: {
				wishlistId: watchlistItemId,
				userId: userId,
			},
		});

		if (deletedItem.count === 0) {
			console.log("Error 404: Watchlist item not found for deletion");
			return res.status(404).json({ error: "Item not found" });
		}

		console.log(`User ${userId} deleted item ${watchlistItemId}`);
		return res
			.status(200)
			.json({ message: "Item deleted successfully", deletedItem });
	} catch (error) {
		console.error("Error deleting watchlist item:", error);
		return res.status(500).json({ error: "Internal server error" });
	}
};
