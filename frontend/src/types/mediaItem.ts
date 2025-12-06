export type MediaType = "MOVIE" | "TV" | "ANIME";
export type ApiSource = "TMDB" | "TVDB" | "ANILIST";

export interface TMDBSearchResult {
	title: string;
	apiSource: ApiSource;
	apiId: string;
	type: MediaType;
	poster_path: string | null;
	release_date: string;
}

export interface MediaItem {
	itemId: number;
	title: string;
	type: MediaType;
	apiSource: ApiSource;
	apiId: string;
	metadata: {
		// essential fields
		posterPath: string | null;
		releaseDate: string | null;
		genres: string[];
		overview: string | null;
		runtime?: number | null; // in minutes, only for movies
		episodeRunTime?: number[] | null; // in minutes, only for TV shows
		rating: number | null;

		// additional fields thats nice to have
		backdropPath?: string | null;
		status?: string | null;
		tagline?: string | null;
		originalLanguage?: string | null;
		originalTitle?: string | null; // for movies
		imdbId?: string | null;
		voteCount?: number | null;

		// TV show specific fields
		endDatate?: string | null;
		totalEpisodes?: number | null;
		totalSeasons?: number | null;
		languages?: string[] | null;
		originalCountry?: string[] | null;
		originalName?: string | null; // for TV shows
		seasons?: Array<{
			seasonNumber: number;
			episodeCount: number;
			posterPath: string | null;
			airDate: string | null;
		}> | null;
	};
}
