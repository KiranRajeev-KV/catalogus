import axios from "axios";
import { ApiSource, Type } from "../generated/prisma/client.js";
import "dotenv/config";
import type { TMDBMovie, TMDBTV } from "../types/tmdb.js";
import axiosRetry from "axios-retry";
import { cache } from "./cache.service.js";

const getCacheKey = (type: string, query: string) =>
	`search:${type}:${query.toLowerCase().trim()}`;

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

// search movies from TMDB
export async function searchTMDBMovie(query: string) {
	const cacheKey = getCacheKey("MOVIE", query);

	const cachedResult = await cache.get(cacheKey);
	if (cachedResult) {
		console.log(`[CACHE HIT] Serving "${query}" from Redis`);
		return cachedResult;
	}
	console.log(`[CACHE MISS] Fetching "${query}" from TMDB`);

	const searchResults = await api.get(`/search/movie`, {
		params: {
			query: query,
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
		}),
	);

	await cache.set(cacheKey, structuredResults, 86400); // cache for 24 hours

	return structuredResults;
}

// search TV shows from TMDB
export async function searchTMDBTV(query: string) {
	const cacheKey = getCacheKey("TV", query);

	const cachedResult = await cache.get(cacheKey);
	if (cachedResult) {
		console.log(`[CACHE HIT] Serving "${query}" from Redis`);
		return cachedResult;
	}
	console.log(`[CACHE MISS] Fetching "${query}" from TMDB`);

	const searchResults = await api.get(`/search/tv`, {
		params: {
			query: query,
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
	}));

	await cache.set(cacheKey, structuredResults, 86400);

	return structuredResults;
}

// get movie details from TMDB by apiId
export async function getTMDBMovieDetails(apiId: string) {
	const cacheKey = `movie:${apiId}`;
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
}

// get TV show details from TMDB by apiId
export async function getTMDBTVDetails(apiId: string) {
	const cacheKey = `tv:${apiId}`;

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
}
