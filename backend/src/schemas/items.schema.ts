// src/schemas/items.schema.ts
import { z } from "zod";
import { Type } from "../generated/prisma/client.js";

// search items query schema
export const SearchItemsSchema = z.object({
	type: z.nativeEnum(Type).optional(),
	q: z.string().trim().min(1).optional(),
});
export type SearchItemsQuery = z.infer<typeof SearchItemsSchema>;

// item params schema
export const ItemParamsSchema = z.object({
	id: z.coerce.number().int().positive(),
});
export type ItemParams = z.infer<typeof ItemParamsSchema>;

export const AddItemSchemea = z.object({
	title: z.string().min(1),
	type: z.nativeEnum(Type),
	apiSource: z.string(),
	apiId: z.string(),
	metadata: z.record(z.string(), z.any()).optional(),
});
export type AddItemBody = z.infer<typeof AddItemSchemea>;

// update item schema
export const UpdateMediaItemSchema = z.object({
	title: z.string().min(1).optional(),
	type: z.nativeEnum(Type).optional(),
	// Validate metadata is an object if provided
	metadata: z.record(z.string(), z.any()).optional(),
});
export type UpdateMediaItemBody = z.infer<typeof UpdateMediaItemSchema>;
