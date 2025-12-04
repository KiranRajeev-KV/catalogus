// backend/src/controllers/watchlist.controller.ts
import type { Request, Response } from "express";
import z from "zod";
import { prisma } from "../db/client.js";
import { AddWatchlistSchema, GetWatchlistSchema } from "../schemas/watchlist.schema.js";
import { getTMDBMovieDetails, getTMDBTVDetails } from "../services/tmdb.service.js";

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
			return res.status(409).json({ error: "Item already exists in watchlist" });
		}

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
				details = {};
				break;
			}
		}

		if (!details) {
			console.log("Error 500: Failed to fetch media item details");
			return res.status(500).json({ error: "Failed to fetch media item details" });
		}

		// 3. create or connect the media item in MediaItem table
		const mediaItem = await prisma.mediaItem.upsert({
			where: {
				apiSource_apiId: {
					apiId: apiId,
					apiSource: "TMDB",
				},
			},
			update: {},
			create: details
		});

		if (!mediaItem) {
			console.log("Error 500: Failed to create or connect media item");
			return res.status(500).json({ error: "Failed to create or connect media item" });
		}

		// 4. create the watchlist entry
		const watchlistEntry = await prisma.wishlist.create({
			data: {
				userId: userId,
				mediaItemId: mediaItem.itemId,
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
}
