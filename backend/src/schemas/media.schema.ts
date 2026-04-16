import z from "zod";
import { Type } from "../generated/prisma/enums.js";

const IncludeAdultSchema = z.preprocess((value) => {
	if (typeof value === "boolean") {
		return value;
	}

	if (typeof value === "string") {
		const normalized = value.trim().toLowerCase();
		if (normalized === "true") {
			return true;
		}
		if (normalized === "false") {
			return false;
		}
	}

	return value;
}, z.boolean().default(false));

export const SearchMediaSchema = z.object({
	// type
	type: z.nativeEnum(Type),

	// q - search query
	q: z.string().min(1, "Search query cannot be empty"),

	// include adult anime content in results
	includeAdult: IncludeAdultSchema,
});

export type SearchMediaQuery = z.infer<typeof SearchMediaSchema>;
