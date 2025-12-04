import { z } from "zod";
import { Status, Type } from "../generated/prisma/enums.js";

export enum SortFilter {
	latest = "latest",
	oldest = "oldest",
	score_high = "score_high",
	score_low = "score_low",
	title_az = "title_az",
	title_za = "title_za",
}

export const GetWatchlistSchema = z.object({
	// pagination - deafult:1, min:1
	page: z.coerce.number().min(1).default(1),

	// limit - default:10, min:1, max:30
	limit: z.coerce.number().min(1).max(30).default(10),

	// filters
	// status?
	status: z.nativeEnum(Status).optional(),

	// type?
	type: z.nativeEnum(Type).optional(),

	// sorting - default: latest
	sort: z.enum(SortFilter).default(SortFilter.latest),

	// q? - search query
	q: z.string().trim().min(1).optional(),
});

export type GetWatchlistQuery = z.infer<typeof GetWatchlistSchema>;
