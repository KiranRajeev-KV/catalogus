import axios from "axios";
import { ApiSource, Type } from "../generated/prisma/client.js";
import "dotenv/config";
import type { TMDBMovie, TMDBTV } from "../types/tmdb.js";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

const api = axios.create({
	baseURL: TMDB_BASE_URL,
	params: {
		api_key: TMDB_API_KEY,
	},
});

// search movies from TMDB
export async function searchTMDBMovie(query: string) {
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

	return structuredResults;
}

// search TV shows from TMDB
export async function searchTMDBTV(query: string) {
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

	return structuredResults;
}
