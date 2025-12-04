import z from "zod";
import { Type } from "../generated/prisma/enums.js";

export const SearchMediaSchema = z.object({
	// type
	type: z.nativeEnum(Type),

	// q - search query
	q: z.string().min(1, "Search query cannot be empty"),
});

export type SearchMediaQuery = z.infer<typeof SearchMediaSchema>;
