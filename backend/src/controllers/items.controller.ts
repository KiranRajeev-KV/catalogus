// src/controllers/items.controller.ts
import type { Request, Response } from "express";
import z from "zod";
import { prisma } from "../db/client.js";
import {
	ItemParamsSchema,
	SearchItemsSchema,
	UpdateMediaItemSchema,
} from "../schemas/items.schema.js";

// Search internal DB for items
export const searchItems = async (req: Request, res: Response) => {
	const result = SearchItemsSchema.safeParse(req.query);

	if (!result.success) {
		// return empty array for invalid queries instead of error - easier handling on frontend
		return res.json([]);
	}

	const { q } = result.data;
	if (!q) return res.json([]);

	try {
		const items = await prisma.mediaItem.findMany({
			where: {
				title: {
					contains: q,
					mode: "insensitive",
				},
			},
			take: 10,
		});
		res.json(items);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Search failed" });
	}
};

// Get single item details
export const getItemDetails = async (req: Request, res: Response) => {
	const params = ItemParamsSchema.safeParse(req.params);

	if (!params.success) {
		return res.status(400).json({ error: "Invalid ID" });
	}

	const { id } = params.data;

	try {
		const item = await prisma.mediaItem.findUnique({
			where: { itemId: id },
		});

		if (!item) return res.status(404).json({ error: "Item not found" });

		res.json(item);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Failed to fetch item" });
	}
};

// update item metadata
export const updateItem = async (req: Request, res: Response) => {
	const params = ItemParamsSchema.safeParse(req.params);

	if (!params.success) {
		return res.status(400).json({ error: "Invalid ID" });
	}

	const body = UpdateMediaItemSchema.safeParse(req.body);
	if (!body.success) {
		return res.status(400).json({
			error: "Invalid update data",
			details: z.treeifyError(body.error),
		});
	}

	const { id } = params.data;
	const updates = body.data;

	// prisma takes string | StringFieldUpdateOperationsInput for string fields
	// so we need to construct the update object conditionally
	const prismaUpdates = {
		...(updates.title !== undefined && { title: { set: updates.title } }),
		...(updates.type !== undefined && { type: { set: updates.type } }),
		...(updates.metadata !== undefined && { metadata: updates.metadata }),
	};

	try {
		const item = await prisma.mediaItem.update({
			where: { itemId: id },
			data: prismaUpdates,
		});

		res.json(item);
	} catch (error: any) {
		// Handle "Record Not Found" (Prisma Error P2025)
		if (error.code === "P2025") {
			return res.status(404).json({ error: "Item not found to update" });
		}
		console.error(error);
		res.status(500).json({ error: "Failed to update item" });
	}
};
