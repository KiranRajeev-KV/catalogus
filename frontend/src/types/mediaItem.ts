export type MediaType = "MOVIE" | "TV" | "ANIME" | "DRAMA";
export type ApiSource = "TMDB" | "TVDB" | "ANILIST" | "MDL";

export interface MediaItem {
	itemId: number;
	title: string;
	apiSource: ApiSource;
	apiId: string;
	type: MediaType;
	metadata: {
		adult?: boolean;
		backdrop_path?: string;
		genre_ids?: number[];
		original_language?: string;
		original_title?: string;
		overview?: string;
		popularity?: number;
		poster_path?: string;
		release_date?: string;
		video?: boolean;
		vote_average?: number;
		vote_count?: number;
	};
	createdAt: string;
	updatedAt: string;
}
