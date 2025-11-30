import axios from "axios";
import { ApiSource, Type } from "../generated/prisma/client.js";
import "dotenv/config";
import type { TMDBMovie } from "../types/tmdb.js";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

const api = axios.create({
	baseURL: TMDB_BASE_URL,
	params: {
		api_key: TMDB_API_KEY,
	},
});

// search movies from TMDB
export async function searchTMDB(query: string) {
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
			metadata: {
				adult: item.adult,
				backdrop_path: item.backdrop_path,
				genre_ids: item.genre_ids,
				original_language: item.original_language,
				original_title: item.original_title,
				overview: item.overview,
				popularity: item.popularity,
				poster_path: item.poster_path,
				release_date: item.release_date,
				video: item.video,
				vote_average: item.vote_average,
				vote_count: item.vote_count,
			},
		}),
	);

	return structuredResults;
}
