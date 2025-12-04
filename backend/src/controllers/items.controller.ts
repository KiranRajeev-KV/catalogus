// src/controllers/items.controller.ts
import type { Request, Response } from "express";
import z from "zod";
import { prisma } from "../db/client.js";
import type { Type } from "../generated/prisma/enums.js";
import {
	AddItemSchemea,
	ItemParamsSchema,
	SearchItemsSchema,
	UpdateMediaItemSchema,
} from "../schemas/items.schema.js";
import { searchTMDBMovie } from "../services/tmdb.service.js";
import type { AddMediaItemDto } from "../types/media.js";

export const addItem = async (req: Request, res: Response) => {
	const body = AddItemSchemea.safeParse(req.body);
	if (!body.success) {
		return res.status(400).json({
			error: "Invalid item data",
			details: z.treeifyError(body.error),
		});
	}

	const newItemData = body.data;

	try {
		const newItem = await prisma.mediaItem.create({
			data: newItemData,
		});
		res.status(201).json(newItem);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Failed to add item" });
	}
};

// Search internal DB and external APIs for items
export const searchItems = async (req: Request, res: Response) => {
	const result = SearchItemsSchema.safeParse(req.query);

	if (!result.success) {
		// return empty array for invalid queries instead of error - easier handling on frontend
		return res.json([]);
	}

	const { type, q } = result.data;
	if (!q) return res.json([]);

	try {
		const items = await prisma.mediaItem.findMany({
			where: {
				title: {
					contains: q,
					mode: "insensitive",
				},
				...(type && { type }),
			},
			take: 10,
		});

		// search external APIs if needed
		let externalSearch: AddMediaItemDto[] = [];
		switch (type as Type) {
			case "MOVIE":
				externalSearch = await searchTMDB(q);
				break;
			case "TV":
				//const externalSearchTV = await searchTVDB(q);
				break;
			case "ANIME":
				// const externalSearchAnime = await searchAnilist(q);
				break;
			case "DRAMA":
				// const externalSearchDrama = await searchMDL(q);
				break;
			default:
				break;
		}

		// removing duplicates based on apiId of items and apiId of externalSearch
		const existingApiIds = new Set(items.map((item) => item.apiId));
		const filteredExternalSearch = externalSearch.filter(
			(item) => !existingApiIds.has(item.apiId),
		);

		// combine internal and external results
		const combinedResults = [...items, ...filteredExternalSearch];
		res.json(combinedResults);
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
