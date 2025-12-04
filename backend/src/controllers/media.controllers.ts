// backend/src/controllers/media.controllers.ts
import type { Request, Response } from "express";
import z from "zod";
import { SearchMediaSchema } from "../schemas/media.schema.js";
import { searchTMDBMovie, searchTMDBTV } from "../services/tmdb.service.js";

// GET	/api/media/search?type=MOVIE&q=Inception
export const searchMedia = async (req: Request, res: Response) => {
	console.log("Received GET /api/media/search request with query:", req.query);

	// validate query parameters
	const result = SearchMediaSchema.safeParse(req.query);
	if (!result.success) {
		console.log("Error 400: Invalid query parameters", result.error);
		return res.status(400).json({
			error: "Invalid query parameters",
			details: z.treeifyError(result.error),
		});
	}

	const { type, q } = result.data;

	// MOVIE -> search in TMDB
	// TV -> search in TMDB
	// ANIME -> search in ANILIST

	switch (type) {
		case "MOVIE": {
			const movies = await searchTMDBMovie(q);
			console.log(`Found ${movies.length} movies for query "${q}"`);
			return res.status(200).json({ results: movies });
		}
		case "TV": {
			const tvshows = await searchTMDBTV(q);
			console.log(`Found ${tvshows.length} TV shows for query "${q}"`);
			return res.status(200).json({ results: tvshows });
		}
	}
};
