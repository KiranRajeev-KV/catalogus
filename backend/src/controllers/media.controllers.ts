// backend/src/controllers/media.controllers.ts
import type { Request, Response } from "express";
import z from "zod";
import { SearchMediaSchema } from "../schemas/media.schema.js";
import { searchAniListAnime } from "../services/anilist.service.js";
import { searchTMDBMovie, searchTMDBTV } from "../services/tmdb.service.js";
import { prisma } from "../db/client.js";
import { Type } from "../generated/prisma/enums.js";
import { IntegrationError } from "../lib/integration-error.js";

type SearchResultShape = {
	title: string;
	apiSource: string;
	apiId: string;
	type: Type;
	poster_path: string | null;
	release_date: string | null;
};

function isObject(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function extractString(value: unknown): string | null {
	return typeof value === "string" && value.length > 0 ? value : null;
}

function mapDBFallbackResults(items: Array<{ title: string; apiSource: string; apiId: string; type: Type; metadata: unknown }>): SearchResultShape[] {
	return items.map((item) => {
		const metadata = isObject(item.metadata) ? item.metadata : null;
		const posterPath = metadata ? extractString(metadata.posterPath) : null;
		const releaseDate = metadata ? extractString(metadata.releaseDate) : null;

		return {
			title: item.title,
			apiSource: item.apiSource,
			apiId: item.apiId,
			type: item.type,
			poster_path: posterPath,
			release_date: releaseDate,
		};
	});
}

async function findLocalSearchFallback(type: Type, query: string) {
	const fallbackItems = await prisma.mediaItem.findMany({
		where: {
			type,
			title: {
				contains: query,
				mode: "insensitive",
			},
		},
		orderBy: {
			updatedAt: "desc",
		},
		take: 20,
		select: {
			title: true,
			apiSource: true,
			apiId: true,
			type: true,
			metadata: true,
		},
	});

	return mapDBFallbackResults(fallbackItems);
}

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

	const { type, q, includeAdult } = result.data;

	// MOVIE -> search in TMDB
	// TV -> search in TMDB
	// ANIME -> search in ANILIST

	try {
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
			case "ANIME": {
				const anime = await searchAniListAnime(q, includeAdult);
				console.log(`Found ${anime.length} anime for query "${q}"`);
				return res.status(200).json({ results: anime });
			}
		}
	} catch (error) {
		if (error instanceof IntegrationError) {
			console.error("Search provider integration error:", error);
			const fallbackResults = await findLocalSearchFallback(type, q);

			if (fallbackResults.length > 0) {
				return res.status(200).json({
					results: fallbackResults,
					meta: {
						fallbackUsed: true,
						fallbackSource: "LOCAL_DB",
						warning:
							"Live provider is temporarily unavailable. Showing cached watchlist matches.",
						integration: {
							provider: error.provider,
							retryable: error.retryable,
							retryAttempts: error.retryAttempts ?? null,
						},
					},
				});
			}

			return res.status(error.statusCode).json({
				error: "Failed to search media",
				details: {
					provider: error.provider,
					retryable: error.retryable,
					retryAttempts: error.retryAttempts ?? null,
					fallbackAvailable: false,
					message: error.publicMessage,
				},
			});
		}

		console.error("Error 500: Failed to fetch media search results", error);
		return res.status(500).json({
			error: "Failed to search media",
			details: {
				retryable: true,
				fallbackAvailable: false,
				message: "Unexpected error while searching media.",
			},
		});
	}
};
