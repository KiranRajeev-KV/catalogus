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

// get movie details from TMDB by apiId
export async function getTMDBMovieDetails(apiId: string) {
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
			genres: movieDetails.data.genres.map((g: { id: number; name: string }) => g.name),
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
	}

	return structuredDetails;
}

// get TV show details from TMDB by apiId
export async function getTMDBTVDetails(apiId: string) {
	const tvDetails = await api.get(`/tv/${apiId}`);
	return tvDetails.data;
}