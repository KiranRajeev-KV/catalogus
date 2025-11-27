// src/controllers/wishlist.controller.ts
import type { Request, Response } from "express";
import { prisma } from "../db/client.js";
import {
	AddToWishlistSchema,
	GetWishlistSchema,
	UpdateWishlistSchema,
} from "../schemas/wishlist.schema.js";
import z from "zod";

export const getWishlist = async (req: Request, res: Response) => {
	// Assuming you have middleware that adds user to req
	// const userId = req.user.id;
	const userId = "user_123_placeholder";

	const result = GetWishlistSchema.safeParse(req.query);
	if (!result.success) {
		return res.status(400).json({
			error: "Invalid query parameters",
			details: z.treeifyError(result.error),
		});
	}

	const { page, limit, status, type, sort } = result.data;

	// pagination calculation
	const skip = (page - 1) * limit;

	const sortMapping: Record<string, any> = {
		latest: { updated_at: "desc" },
		oldest: { updated_at: "asc" },
		score_high: { rating: "desc" },
		score_low: { rating: "asc" },
		// Sorting by the Relation (Joined Table)
		title_az: { media_item: { title: "asc" } },
		title_za: { media_item: { title: "desc" } },
	};

	const orderBy = sortMapping[sort] || { updated_at: "desc" };

	// filter object to be used as WHERE clause
	const whereClause = {
		user_id: userId,
		// If status is provided, add it to the filter
		...(status && { status }),
		// If type is provided, filter inside the RELATION
		...(type && {
			media_item: {
				type: type,
			},
		}),
	};

	try {
		// 2 queries needed: one for data, one for total count
		// query 1: Get the actual data
		const wishlist = await prisma.wishlist.findMany({
			where: {
				user_id: userId,
				...(status && { status }),
				...(type && { media_item: { type } }),
			},
			take: limit,
			skip: skip,
			orderBy: orderBy,
			include: { media_item: true },
		});

		// query 2: Get total count (for frontend pagination UI)
		const totalCount = await prisma.wishlist.count({
			where: whereClause,
		});

		res.json({
			data: wishlist,
			pagination: {
				total: totalCount,
				page: page,
				limit: limit,
				totalPages: Math.ceil(totalCount / limit),
			},
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Failed to fetch wishlist" });
	}
};

export const addToWishlist = async (req: Request, res: Response) => {
	const userId = "user_123_placeholder";
	const result = AddToWishlistSchema.safeParse(req.body);

	if (!result.success) {
		return res.status(400).json({
			error: "Invalid input data",
			details: z.treeifyError(result.error),
		});
	}

	const { status, rating, media_item } = result.data;

	try {
		const entry = await prisma.wishlist.create({
			data: {
				user: { connect: { user_id: userId } },
				status: status || "PLAN_TO_WATCH",
				rating: rating,
				media_item: {
					connectOrCreate: {
						where: {
							api_source_api_id: {
								api_source: media_item.api_source,
								api_id: media_item.api_id,
							},
						},
						create: {
							title: media_item.title,
							type: media_item.type,
							api_source: media_item.api_source,
							api_id: media_item.api_id,
							metadata: media_item.metadata || {},
						},
					},
				},
			},
			include: { media_item: true },
		});

		res.status(201).json(entry);
	} catch (error: any) {
		if (error.code === "P2002") {
			res.status(409).json({ error: "Item is already in your wishlist." });
		} else {
			console.error(error);
			res.status(500).json({ error: "Failed to add item." });
		}
	}
};

export const updateWishlistEntry = async (req: Request, res: Response) => {
	const { id } = req.params;

	const result = UpdateWishlistSchema.safeParse(req.body);
	if (!result.success) {
		return res.status(400).json({
			error: "Invalid updates",
			details: z.treeifyError(result.error),
		});
	}

	try {
		const updated = await prisma.wishlist.update({
			where: { wishlist_id: id },
			data: result.data,
		});

		res.json(updated);
	} catch (error: any) {
		// Handle "Record Not Found" from Prisma
		if (error.code === "P2025") {
			return res.status(404).json({ error: "Item not found" });
		}
		console.error(error);
		res.status(500).json({ error: "Failed to update item" });
	}
};

export const removeFromWishlist = async (req: Request, res: Response) => {
	const { id } = req.params;

	try {
		await prisma.wishlist.delete({
			where: { wishlist_id: id },
		});
		res.status(204).send();
	} catch (error: any) {
		if (error.code === "P2025") {
			return res.status(404).json({ error: "Item not found" });
		}
		res.status(500).json({ error: "Failed to delete item" });
	}
};
