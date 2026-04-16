export interface AniListTitle {
	english: string | null;
	romaji: string | null;
	native: string | null;
}

export interface AniListDate {
	year: number | null;
	month: number | null;
	day: number | null;
}

export interface AniListSearchMedia {
	id: number;
	isAdult: boolean;
	title: AniListTitle;
	coverImage: {
		large: string | null;
		medium: string | null;
	};
	startDate: AniListDate;
}

export interface AniListDetailMedia {
	id: number;
	title: AniListTitle;
	description: string | null;
	genres: string[];
	episodes: number | null;
	duration: number | null;
	averageScore: number | null;
	status: string | null;
	startDate: AniListDate;
	endDate: AniListDate;
	bannerImage: string | null;
	coverImage: {
		large: string | null;
		medium: string | null;
	};
	studios: {
		nodes: Array<{
			name: string;
		}>;
	} | null;
	trailer: {
		id: string | null;
		site: string | null;
		thumbnail: string | null;
	} | null;
}
