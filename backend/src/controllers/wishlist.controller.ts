// src/controllers/wishlist.controller.ts
import type { Request, Response } from "express";
import z from "zod";
import { prisma } from "../db/client.js";
import {
	AddToWishlistSchema,
	GetWishlistSchema,
	UpdateWishlistSchema,
} from "../schemas/wishlist.schema.js";

export const getWishlist = async (req: Request, res: Response) => {
	const user = (req as any).user;
	const userId = user.id;

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
		latest: { updatedAt: "desc" },
		oldest: { updatedAt: "asc" },
		score_high: { rating: "desc" },
		score_low: { rating: "asc" },
		// Sorting by the Relation (Joined Table)
		title_az: { mediaItem: { title: "asc" } },
		title_za: { mediaItem: { title: "desc" } },
	};

	const orderBy = sortMapping[sort] || { updatedAt: "desc" };

	// filter object to be used as WHERE clause
	const whereClause = {
		userId: userId,
		// If status is provided, add it to the filter
		...(status && { status }),
		// If type is provided, filter inside the RELATION
		...(type && {
			mediaItem: {
				type: type,
			},
		}),
	};

	try {
		// 2 queries needed: one for data, one for total count
		// query 1: Get the actual data
		const wishlist = await prisma.wishlist.findMany({
			where: {
				userId: userId,
				...(status && { status }),
				...(type && { mediaItem: { type } }),
			},
			take: limit,
			skip: skip,
			orderBy: orderBy,
			include: { mediaItem: true },
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
	const user = (req as any).user;
	const userId = user.id;

	const result = AddToWishlistSchema.safeParse(req.body);

	if (!result.success) {
		return res.status(400).json({
			error: "Invalid input data",
			details: z.treeifyError(result.error),
		});
	}

	const { status, rating, mediaItem } = result.data;

	try {
		const entry = await prisma.wishlist.create({
			data: {
				user: { connect: { id: userId } },
				status: status || "PLAN_TO_WATCH",
				rating: rating,
				mediaItem: {
					connectOrCreate: {
						where: {
							apiSource_apiId: {
								apiSource: mediaItem.apiSource,
								apiId: mediaItem.apiId,
							},
						},
						create: {
							title: mediaItem.title,
							type: mediaItem.type,
							apiSource: mediaItem.apiSource,
							apiId: mediaItem.apiId,
							metadata: mediaItem.metadata || {},
						},
					},
				},
			},
			include: { mediaItem: true },
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
			where: { wishlistId: id },
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
			where: { wishlistId: id },
		});
		res.status(204).send();
	} catch (error: any) {
		if (error.code === "P2025") {
			return res.status(404).json({ error: "Item not found" });
		}
		res.status(500).json({ error: "Failed to delete item" });
	}
};
