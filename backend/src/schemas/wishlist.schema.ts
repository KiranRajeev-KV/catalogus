// src/schemas/wishlist.schema.ts
import { z } from "zod";
import { ApiSource, Status, Type } from "../generated/prisma/client.js";

export const GetWishlistSchema = z.object({
	// pagination with default and minimum as 1
	page: z.coerce.number().min(1).default(1),
	// no of items per page with default of 10 to 100
	limit: z.coerce.number().min(1).max(100).default(10),

	// Filters for wishlist entries
	status: z.nativeEnum(Status).optional(),
	type: z.nativeEnum(Type).optional(),

	// Sorting: strictly allow only specific sort
	sort: z
		.enum([
			"latest", // updated_at desc
			"oldest", // updated_at asc
			"score_high", // score desc
			"score_low", // score asc
			"title_az", // media_item.title asc
			"title_za", // media_item.title desc
		])
		.default("latest"),
});
export type GetWishlistQuery = z.infer<typeof GetWishlistSchema>;

export const AddToWishlistSchema = z.object({
	// Default status is PLAN_TO_WATCH
	status: z.nativeEnum(Status).default(Status.PLAN_TO_WATCH),
	rating: z.number().min(0).max(10).default(0),
	mediaItem: z.object({
		title: z.string().min(1, "Title is required"),
		type: z.nativeEnum(Type),
		apiSource: z.nativeEnum(ApiSource),
		apiId: z.string().min(1, "API ID is required"),
		// Allow any JSON object for metadata
		metadata: z.record(z.string(), z.any()).optional().default({}),
	}),
});
export type AddToWishlistDto = z.infer<typeof AddToWishlistSchema>;

export const UpdateWishlistSchema = z.object({
	status: z.nativeEnum(Status).optional(),
	rating: z.number().min(0).max(10).default(0).optional(),
	comments: z.string().max(1000).optional(),
});
export type UpdateWishlistDto = z.infer<typeof UpdateWishlistSchema>;
