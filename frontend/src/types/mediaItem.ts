export interface MediaItem {
	itemId: number;
	title: string;
	apiSource: "TMDB" | "TVDB" | "ANILIST" | "MDL";
	apiId: string;
	type: "MOVIE" | "TV" | "ANIME" | "DRAMA";
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
