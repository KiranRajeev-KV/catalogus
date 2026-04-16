import axios from "axios";
import { ApiSource, Type } from "../generated/prisma/client.js";
import "dotenv/config";
import type { TMDBMovie, TMDBTV } from "../types/tmdb.js";
import axiosRetry from "axios-retry";
import { cache } from "./cache.service.js";
import {
	IntegrationError,
	type IntegrationOperation,
	toIntegrationError,
} from "../lib/integration-error.js";

type SearchPayload<T> = {
	results: T[];
	hasNextPage: boolean;
};

function normalizeCachedSearchPayload<T>(
	cachedResult: unknown,
): SearchPayload<T> | null {
	if (!cachedResult) {
		return null;
	}

	if (Array.isArray(cachedResult)) {
		return {
			results: cachedResult as T[],
			hasNextPage: cachedResult.length > 0,
		};
	}

	if (
		typeof cachedResult === "object" &&
		cachedResult !== null &&
		Array.isArray((cachedResult as { results?: unknown }).results)
	) {
		return {
			results: (cachedResult as { results: T[] }).results,
			hasNextPage: Boolean(
				(cachedResult as { hasNextPage?: boolean }).hasNextPage,
			),
		};
	}

	return null;
}

const getCacheKey = (type: string, query: string, page: number, limit: number) =>
	`search:${type}:${query.toLowerCase().trim()}:${page}:${limit}`;

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

const api = axios.create({
	baseURL: TMDB_BASE_URL,
	timeout: 10000,
	params: {
		api_key: TMDB_API_KEY,
	},
});

axiosRetry(api, {
	retries: 3,
	retryDelay: axiosRetry.exponentialDelay,
	retryCondition: (error) =>
		error.code === "ECONNRESET" ||
		axiosRetry.isNetworkError(error) ||
		axiosRetry.isRetryableError(error),
});

function ensureTMDBConfigured(operation: IntegrationOperation) {
	if (TMDB_API_KEY?.trim()) {
		return;
	}

	throw new IntegrationError({
		message: "TMDB API key is missing",
		publicMessage: "TMDB integration is not configured correctly.",
		provider: "TMDB",
		operation,
		code: "PROVIDER_BAD_CONFIG",
		retryable: false,
		statusCode: 500,
	});
}

// search movies from TMDB
export async function searchTMDBMovie(
	query: string,
	page = 1,
	limit = 20,
) {
	ensureTMDBConfigured("search");
	const cacheKey = getCacheKey("MOVIE", query, page, limit);

	try {
		const cachedResult = await cache.get(cacheKey);
		if (cachedResult) {
			console.log(`[CACHE HIT] Serving "${query}" from Redis`);
			const normalized = normalizeCachedSearchPayload<
				{
					title: string;
					apiSource: ApiSource;
					apiId: string;
					type: Type;
					poster_path: string | null;
					release_date: string | null;
					community_rating: number | null;
					vote_count: number | null;
					popularity: number | null;
				}
			>(cachedResult);
			if (normalized) {
				return normalized;
			}
		}
		console.log(`[CACHE MISS] Fetching "${query}" from TMDB`);

		const searchResults = await api.get(`/search/movie`, {
			params: {
				query: query,
				page,
				include_adult: false,
			},
		});

		// sort searchResults by popularity descending
		searchResults.data.results.sort(
			(a: TMDBMovie, b: TMDBMovie) => b.popularity - a.popularity,
		);

		// map searchResults to structured format
		const structuredResults = searchResults.data.results.map(
			(item: TMDBMovie) => ({
				title: item.title,
				apiSource: ApiSource.TMDB,
				apiId: item.id.toString(),
				type: Type.MOVIE,
				poster_path: item.poster_path,
				release_date: item.release_date,
				community_rating: item.vote_average ?? null,
				vote_count: item.vote_count ?? null,
				popularity: item.popularity ?? null,
			}),
		);

		const trimmedResults = structuredResults.slice(0, limit);

		const payload = {
			results: trimmedResults,
			hasNextPage: Number(searchResults.data.total_pages || 0) > page,
		};

		await cache.set(cacheKey, payload, 86400); // cache for 24 hours

		return payload;
	} catch (error) {
		throw toIntegrationError("TMDB", "search", error);
	}
}

// search TV shows from TMDB
export async function searchTMDBTV(
	query: string,
	page = 1,
	limit = 20,
) {
	ensureTMDBConfigured("search");
	const cacheKey = getCacheKey("TV", query, page, limit);

	try {
		const cachedResult = await cache.get(cacheKey);
		if (cachedResult) {
			console.log(`[CACHE HIT] Serving "${query}" from Redis`);
			const normalized = normalizeCachedSearchPayload<
				{
					title: string;
					apiSource: ApiSource;
					apiId: string;
					type: Type;
					poster_path: string | null;
					release_date: string | null;
					community_rating: number | null;
					vote_count: number | null;
					popularity: number | null;
				}
			>(cachedResult);
			if (normalized) {
				return normalized;
			}
		}
		console.log(`[CACHE MISS] Fetching "${query}" from TMDB`);

		const searchResults = await api.get(`/search/tv`, {
			params: {
				query: query,
				page,
			},
		});

		// sort searchResults by popularity descending
		searchResults.data.results.sort(
			(a: TMDBTV, b: TMDBTV) => b.popularity - a.popularity,
		);

		// map searchResults to structured format
		const structuredResults = searchResults.data.results.map((item: TMDBTV) => ({
			title: item.name,
			apiSource: ApiSource.TMDB,
			apiId: item.id.toString(),
			type: Type.TV,
			poster_path: item.poster_path,
			release_date: item.first_air_date,
			community_rating: item.vote_average ?? null,
			vote_count: item.vote_count ?? null,
			popularity: item.popularity ?? null,
		}));

		const trimmedResults = structuredResults.slice(0, limit);

		const payload = {
			results: trimmedResults,
			hasNextPage: Number(searchResults.data.total_pages || 0) > page,
		};

		await cache.set(cacheKey, payload, 86400);

		return payload;
	} catch (error) {
		throw toIntegrationError("TMDB", "search", error);
	}
}

// get movie details from TMDB by apiId
export async function getTMDBMovieDetails(apiId: string) {
	ensureTMDBConfigured("details");
	const cacheKey = `movie:${apiId}`;

	try {
		const cachedResult = await cache.get(cacheKey);
		if (cachedResult) {
			console.log(`[CACHE HIT] Serving movie ID "${apiId}" from Redis`);
			return cachedResult;
		}
		console.log(`[CACHE MISS] Fetching movie ID "${apiId}" from TMDB`);

		const movieDetails = await api.get(`/movie/${apiId}`);

		const structuredDetails = {
			title: movieDetails.data.title,
			type: Type.MOVIE,
			apiSource: ApiSource.TMDB,
			apiId: movieDetails.data.id.toString(),
			metadata: {
				// essential fields
				posterPath: movieDetails.data.poster_path,
				releaseDate: movieDetails.data.release_date,
				genres: movieDetails.data.genres.map(
					(g: { id: number; name: string }) => g.name,
				),
				overview: movieDetails.data.overview,
				runtime: movieDetails.data.runtime,
				rating: movieDetails.data.vote_average,

				// additional fields thats nice to have
				backdropPath: movieDetails.data.backdrop_path,
				status: movieDetails.data.status,
				tagline: movieDetails.data.tagline,
				originalLanguage: movieDetails.data.original_language,
				originalTitle: movieDetails.data.original_title,
				imdbId: movieDetails.data.imdb_id,
				voteCount: movieDetails.data.vote_count,
			},
		};

		await cache.set(cacheKey, structuredDetails, 86400);

		return structuredDetails;
	} catch (error) {
		throw toIntegrationError("TMDB", "details", error);
	}
}

// get TV show details from TMDB by apiId
export async function getTMDBTVDetails(apiId: string) {
	ensureTMDBConfigured("details");
	const cacheKey = `tv:${apiId}`;

	try {
		const cachedResult = await cache.get(cacheKey);
		if (cachedResult) {
			console.log(`[CACHE HIT] Serving TV ID "${apiId}" from Redis`);
			return cachedResult;
		}
		console.log(`[CACHE MISS] Fetching TV ID "${apiId}" from TMDB`);

		const tvDetails = await api.get(`/tv/${apiId}`);

		const structuredDetails = {
			title: tvDetails.data.name,
			type: Type.TV,
			apiSource: ApiSource.TMDB,
			apiId: tvDetails.data.id.toString(),
			metadata: {
				// essential fields
				posterPath: tvDetails.data.poster_path,
				episodeRunTime: tvDetails.data.episode_run_time,
				releaseDate: tvDetails.data.first_air_date,
				genres: tvDetails.data.genres.map(
					(g: { id: number; name: string }) => g.name,
				),
				endDatate: tvDetails.data.last_air_date,
				totalEpisodes: tvDetails.data.number_of_episodes,
				totalSeasons: tvDetails.data.number_of_seasons,
				overview: tvDetails.data.overview,
				rating: tvDetails.data.vote_average,

				// additional fields thats nice to have
				backdropPath: tvDetails.data.backdrop_path,
				languages: tvDetails.data.languages,
				originalLanguage: tvDetails.data.original_language,
				originCountry: tvDetails.data.origin_country,
				originalName: tvDetails.data.original_name,
				seasons: tvDetails.data.seasons,
				status: tvDetails.data.status,
				tagline: tvDetails.data.tagline,
				voteCount: tvDetails.data.vote_count,
			},
		};

		await cache.set(cacheKey, structuredDetails, 86400);

		return structuredDetails;
	} catch (error) {
		throw toIntegrationError("TMDB", "details", error);
	}
}
