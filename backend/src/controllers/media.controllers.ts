// backend/src/controllers/media.controllers.ts
import type { Request, Response } from "express";
import z from "zod";
import { SearchMediaSchema } from "../schemas/media.schema.js";
import { searchAniListAnime } from "../services/anilist.service.js";
import { searchTMDBMovie, searchTMDBTV } from "../services/tmdb.service.js";
import { prisma } from "../db/client.js";
import { Type } from "../generated/prisma/enums.js";
import { ApiSource } from "../generated/prisma/client.js";
import { IntegrationError } from "../lib/integration-error.js";

type SearchResultShape = {
	title: string;
	apiSource: ApiSource;
	apiId: string;
	type: Type;
	wishlistId?: string | null;
	poster_path: string | null;
	release_date: string | null;
	community_rating: number | null;
	vote_count: number | null;
	popularity: number | null;
	total_episodes: number | null;
	episode_runtime: number | null;
	inWatchlist?: boolean;
};

function isObject(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function extractString(value: unknown): string | null {
	return typeof value === "string" && value.length > 0 ? value : null;
}

function extractNumber(value: unknown): number | null {
	return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function mapDBFallbackResults(
	items: Array<{
		title: string;
		apiSource: ApiSource;
		apiId: string;
		type: Type;
		metadata: unknown;
	}>,
): SearchResultShape[] {
	return items.map((item) => {
		const metadata = isObject(item.metadata) ? item.metadata : null;
		const posterPath = metadata ? extractString(metadata.posterPath) : null;
		const releaseDate = metadata ? extractString(metadata.releaseDate) : null;
		const rating = metadata ? extractNumber(metadata.rating) : null;
		const voteCount = metadata ? extractNumber(metadata.voteCount) : null;
		const totalEpisodes = metadata ? extractNumber(metadata.totalEpisodes) : null;
		const runtime = metadata ? extractNumber(metadata.runtime) : null;
		const episodeRuntime = metadata
			? Array.isArray(metadata.episodeRunTime) &&
				typeof metadata.episodeRunTime[0] === "number"
				? metadata.episodeRunTime[0]
				: null
			: null;

		return {
			title: item.title,
			apiSource: item.apiSource,
			apiId: item.apiId,
			type: item.type,
			poster_path: posterPath,
			release_date: releaseDate,
			community_rating: rating,
			vote_count: voteCount,
			popularity: null,
			total_episodes: totalEpisodes,
			episode_runtime: runtime ?? episodeRuntime,
		};
	});
}

async function findLocalSearchFallback(
	type: Type,
	query: string,
	page: number,
	limit: number,
) {
	const skip = (page - 1) * limit;
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
		skip,
		take: limit + 1,
		select: {
			title: true,
			apiSource: true,
			apiId: true,
			type: true,
			metadata: true,
		},
	});

	const hasMore = fallbackItems.length > limit;
	const items = hasMore ? fallbackItems.slice(0, limit) : fallbackItems;

	return {
		results: mapDBFallbackResults(items),
		hasMore,
	};
}

type SearchCursor = {
	type: Type;
	q: string;
	includeAdult: boolean;
	limit: number;
	page: number;
};

function encodeSearchCursor(cursor: SearchCursor): string {
	return Buffer.from(JSON.stringify(cursor), "utf8").toString("base64url");
}

function decodeSearchCursor(cursor: string): SearchCursor | null {
	try {
		const decoded = Buffer.from(cursor, "base64url").toString("utf8");
		const parsed = JSON.parse(decoded) as Partial<SearchCursor>;
		if (
			!parsed ||
			typeof parsed !== "object" ||
			typeof parsed.page !== "number" ||
			parsed.page < 1 ||
			typeof parsed.q !== "string" ||
			!Object.values(Type).includes(parsed.type as Type) ||
			typeof parsed.includeAdult !== "boolean" ||
			typeof parsed.limit !== "number" ||
			parsed.limit < 1 ||
			parsed.limit > 50
		) {
			return null;
		}

		return parsed as SearchCursor;
	} catch {
		return null;
	}
}

async function enrichWithWatchlistState(
	userId: string,
	results: SearchResultShape[],
): Promise<SearchResultShape[]> {
	if (!Array.isArray(results) || results.length === 0) {
		return results;
	}

	const mediaPairs = results.map((item) => ({
		apiSource: item.apiSource,
		apiId: item.apiId,
	}));

	const matches = await prisma.wishlist.findMany({
		where: {
			userId,
			mediaItem: {
				OR: mediaPairs,
			},
		},
		select: {
			wishlistId: true,
			mediaItem: {
				select: {
					apiSource: true,
					apiId: true,
				},
			},
		},
	});

	const existing = new Map(
		matches.map((item) => [
			`${item.mediaItem.apiSource}:${item.mediaItem.apiId}`,
			item.wishlistId,
		]),
	);

	return results.map((item) => ({
		...item,
		inWatchlist: existing.has(`${item.apiSource}:${item.apiId}`),
		wishlistId: existing.get(`${item.apiSource}:${item.apiId}`) ?? null,
	}));
}

// GET	/api/media/search?type=MOVIE&q=Inception
export const searchMedia = async (req: Request, res: Response) => {
	console.log("Received GET /api/media/search request with query:", req.query);
	const userId = req.user?.id;
	if (!userId) {
		return res.status(401).json({
			data: null,
			meta: {},
			error: {
				code: "UNAUTHORIZED",
				message: "Unauthorized",
				retryable: false,
			},
		});
	}

	// validate query parameters
	const result = SearchMediaSchema.safeParse(req.query);
	if (!result.success) {
		console.log("Error 400: Invalid query parameters", result.error);
		return res.status(400).json({
			data: null,
			meta: {},
			error: {
				code: "VALIDATION_FAILED",
				message: "Invalid query parameters",
				retryable: false,
				details: z.treeifyError(result.error),
			},
		});
	}

	const { type, q, includeAdult, cursor, limit } = result.data;
	let page = 1;
	if (cursor) {
		const parsedCursor = decodeSearchCursor(cursor);
		if (
			!parsedCursor ||
			parsedCursor.q !== q ||
			parsedCursor.type !== type ||
			parsedCursor.includeAdult !== includeAdult ||
			parsedCursor.limit !== limit
		) {
			return res.status(400).json({
				data: null,
				meta: {},
				error: {
					code: "VALIDATION_FAILED",
					message: "Invalid cursor for current query",
					retryable: false,
				},
			});
		}
		page = parsedCursor.page;
	}

	// MOVIE -> search in TMDB
	// TV -> search in TMDB
	// ANIME -> search in ANILIST

	try {
		let searchResults: SearchResultShape[] = [];
		let hasMore = false;
		let provider: "TMDB" | "ANILIST" = type === "ANIME" ? "ANILIST" : "TMDB";

		switch (type) {
			case "MOVIE": {
				const payload = await searchTMDBMovie(q, page, limit);
				searchResults = payload.results;
				hasMore = payload.hasNextPage;
				provider = "TMDB";
				break;
			}
			case "TV": {
				const payload = await searchTMDBTV(q, page, limit);
				searchResults = payload.results;
				hasMore = payload.hasNextPage;
				provider = "TMDB";
				break;
			}
			case "ANIME": {
				const payload = await searchAniListAnime(q, page, limit, includeAdult);
				searchResults = payload.results;
				hasMore = payload.hasNextPage;
				provider = "ANILIST";
				break;
			}
		}

		const enriched = await enrichWithWatchlistState(userId, searchResults);
		const nextCursor = hasMore
			? encodeSearchCursor({
					type,
					q,
					includeAdult,
					limit,
					page: page + 1,
				})
			: null;

		console.log(`Found ${enriched.length} ${type} results for query "${q}"`);
		return res.status(200).json({
			data: {
				results: enriched,
			},
			meta: {
				pagination: {
					limit,
					nextCursor,
					hasMore,
				},
				provider: {
					primary: provider,
					servedBy: provider,
					fallbackUsed: false,
					fallbackSource: null,
				},
			},
			error: null,
		});
	} catch (error) {
		if (error instanceof IntegrationError) {
			console.error("Search provider integration error:", error);
			const fallbackPayload = await findLocalSearchFallback(type, q, page, limit);
			const enrichedFallback = await enrichWithWatchlistState(
				userId,
				fallbackPayload.results,
			);
			const nextCursor = fallbackPayload.hasMore
				? encodeSearchCursor({
						type,
						q,
						includeAdult,
						limit,
						page: page + 1,
					})
				: null;

			if (enrichedFallback.length > 0) {
				return res.status(200).json({
					data: {
						results: enrichedFallback,
					},
					meta: {
						pagination: {
							limit,
							nextCursor,
							hasMore: fallbackPayload.hasMore,
						},
						provider: {
							primary: type === "ANIME" ? "ANILIST" : "TMDB",
							servedBy: "LOCAL_DB",
							fallbackUsed: true,
							fallbackSource: "LOCAL_DB",
							fallbackReasonCode: error.code,
						},
					},
					error: {
						code: "FALLBACK_ONLY_RESULTS",
						message:
							"Live provider is temporarily unavailable. Showing cached local matches.",
						retryable: true,
						provider: error.provider,
					},
				});
			}

			return res.status(error.statusCode).json({
				data: null,
				meta: {
					provider: {
						primary: type === "ANIME" ? "ANILIST" : "TMDB",
						servedBy: type === "ANIME" ? "ANILIST" : "TMDB",
						fallbackUsed: false,
						fallbackSource: null,
					},
				},
				error: {
					code: error.code,
					message: error.publicMessage,
					retryable: error.retryable,
					provider: error.provider,
					upstreamStatus: error.upstreamStatus ?? null,
					retryAttempts: error.retryAttempts ?? null,
					retryAfterMs: error.retryAfterMs ?? null,
					suggestedBackoffMs: error.suggestedBackoffMs ?? null,
					fallbackAvailable: false,
				},
			});
		}

		console.error("Error 500: Failed to fetch media search results", error);
		return res.status(500).json({
			data: null,
			meta: {},
			error: {
				code: "INTERNAL_ERROR",
				message: "Unexpected error while searching media.",
				retryable: true,
				fallbackAvailable: false,
			},
		});
	}
};
