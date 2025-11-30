export enum Type {
	MOVIE,
	TV,
	ANIME,
	DRAMA,
}

export enum ApiSource {
	TMDB,
	TVDB,
	ANILIST,
	MDL,
}

export enum Status {
	WATCHING,
	COMPLETED,
	ON_HOLD,
	DROPPED,
	PLAN_TO_WATCH,
}

export interface MediaItem {
	itemId: number;
	title: string;
	apiSource: ApiSource;
	apiId: string;
	type: Type;
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
