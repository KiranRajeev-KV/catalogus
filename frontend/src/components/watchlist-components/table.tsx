// watchlist table component
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { ApiSource, Type } from "@/types/mediaItem";
import { WatchlistItem } from "@/types/watchlistItem";
import { parse } from "date-fns";

function mapToEnums(item: any): WatchlistItem {
	return {
		...item,
		status: item.status as WatchlistItem["status"],
		completedAt: item.completedAt ? new Date(item.completedAt) : undefined,
		comments: item.comments || undefined,
		mediaItem: {
			...item.mediaItem,
			type: item.mediaItem.type as Type,
			apiSource: item.mediaItem.apiSource as ApiSource,
			metadata: {
				...item.mediaItem.metadata,
				release_date: item.mediaItem.metadata.release_date
					? parse(
							item.mediaItem.metadata.release_date,
							"yyyy-MM-dd",
							new Date(),
						)
					: undefined,
			},
		},
	};
}

const tempWatchlistData: WatchlistItem[] = [
	{
		wishlistId: "cmilyqx3i0000wkum40nkgvjo",
		userId: "MupawCBm3NrnG9FI5HdkmjhcSiNjcHdo",
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
				adult: false,
				video: false,
				overview:
					"101-year-old Rose DeWitt Bukater tells the story of her life aboard the Titanic, 84 years later. A young Rose boards the ship with her mother and fiancé. Meanwhile, Jack Dawson and Fabrizio De Rossi win third-class tickets aboard the ship. Rose tells the whole story from Titanic's departure through to its death—on its first and last voyage—on April 15, 1912.",
				genre_ids: [18, 10749],
				popularity: 29.5103,
				vote_count: 26503,
				poster_path: "/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg",
				release_date: "1997-11-18",
				vote_average: 7.903,
				backdrop_path: "/xnHVX37XZEp33hhCbYlQFq7ux1J.jpg",
				original_title: "Titanic",
				original_language: "en",
			},
			createdAt: "2025-11-30T06:32:31.419Z",
			updatedAt: "2025-11-30T06:32:31.419Z",
		},
	},
	{
		wishlistId: "cmilyqx3i0000wkum40nkgvjo",
		userId: "MupawCBm3NrnG9FI5HdkmjhcSiNjcHdo",
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
				adult: false,
				video: false,
				overview:
					"101-year-old Rose DeWitt Bukater tells the story of her life aboard the Titanic, 84 years later. A young Rose boards the ship with her mother and fiancé. Meanwhile, Jack Dawson and Fabrizio De Rossi win third-class tickets aboard the ship. Rose tells the whole story from Titanic's departure through to its death—on its first and last voyage—on April 15, 1912.",
				genre_ids: [18, 10749],
				popularity: 29.5103,
				vote_count: 26503,
				poster_path: "/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg",
				release_date: "1997-11-18",
				vote_average: 7.903,
				backdrop_path: "/xnHVX37XZEp33hhCbYlQFq7ux1J.jpg",
				original_title: "Titanic",
				original_language: "en",
			},
			createdAt: "2025-11-30T06:32:31.419Z",
			updatedAt: "2025-11-30T06:32:31.419Z",
		},
	},
	{
		wishlistId: "cmilyqx3i0000wkum40nkgvjo",
		userId: "MupawCBm3NrnG9FI5HdkmjhcSiNjcHdo",
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
				adult: false,
				video: false,
				overview:
					"101-year-old Rose DeWitt Bukater tells the story of her life aboard the Titanic, 84 years later. A young Rose boards the ship with her mother and fiancé. Meanwhile, Jack Dawson and Fabrizio De Rossi win third-class tickets aboard the ship. Rose tells the whole story from Titanic's departure through to its death—on its first and last voyage—on April 15, 1912.",
				genre_ids: [18, 10749],
				popularity: 29.5103,
				vote_count: 26503,
				poster_path: "/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg",
				release_date: "1997-11-18",
				vote_average: 7.903,
				backdrop_path: "/xnHVX37XZEp33hhCbYlQFq7ux1J.jpg",
				original_title: "Titanic",
				original_language: "en",
			},
			createdAt: "2025-11-30T06:32:31.419Z",
			updatedAt: "2025-11-30T06:32:31.419Z",
		},
	},
];

const cleanedWatchlistData: WatchlistItem[] = tempWatchlistData.map(mapToEnums);

export function WatchlistTable() {
	return (
		<div className="container mx-auto py-10">
			<DataTable columns={columns} data={cleanedWatchlistData} />
		</div>
	);
}
