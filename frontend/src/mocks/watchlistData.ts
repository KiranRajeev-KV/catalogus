import type { WatchlistItem } from "@/types/watchlistItem";

export const tempWatchlistData: WatchlistItem[] = [
	{
		wishlistId: "w1",
		userId: "u1",
		mediaItemId: 1,
		status: "PLAN_TO_WATCH",
		rating: 0,
		completedAt: null,
		comments: null,
		createdAt: "2025-11-30T16:57:24.745Z",
		updatedAt: "2025-11-30T16:57:24.745Z",
		mediaItem: {
			itemId: 1,
			title: "Titanic",
			type: "MOVIE",
			apiSource: "TMDB",
			apiId: "597",
			metadata: {
				posterPath: "/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg",
				releaseDate: "1997-11-18",
				genres: ["Drama", "Romance"],
				overview:
					"A young aristocrat falls in love with an artist aboard the ill-fated Titanic.",
				rating: 7.9,
			},
		},
	},
	{
		wishlistId: "w2",
		userId: "u1",
		mediaItemId: 2,
		status: "WATCHING",
		rating: 8,
		completedAt: null,
		comments: "Strong start",
		createdAt: "2025-12-01T04:55:57.667Z",
		updatedAt: "2025-12-01T04:55:57.667Z",
		mediaItem: {
			itemId: 2,
			title: "Breaking Bad",
			type: "TV",
			apiSource: "TMDB",
			apiId: "1396",
			metadata: {
				posterPath: "/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg",
				releaseDate: "2008-01-20",
				genres: ["Drama", "Crime"],
				overview:
					"A high school chemistry teacher turns to making methamphetamine after a diagnosis.",
				rating: 8.9,
			},
		},
	},
	{
		wishlistId: "w3",
		userId: "u1",
		mediaItemId: 3,
		status: "COMPLETED",
		rating: 9,
		completedAt: "2025-12-05T08:00:00.000Z",
		comments: "Excellent pacing",
		createdAt: "2025-12-01T04:55:57.667Z",
		updatedAt: "2025-12-05T08:00:00.000Z",
		mediaItem: {
			itemId: 3,
			title: "Attack on Titan",
			type: "ANIME",
			apiSource: "ANILIST",
			apiId: "16498",
			metadata: {
				posterPath:
					"https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498-8b5xpvqzx3f2.jpg",
				releaseDate: "2013-04-07",
				genres: ["Action", "Drama"],
				overview:
					"Humanity fights for survival behind walls as Titans threaten extinction.",
				rating: 8.7,
			},
		},
	},
];
