import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { MyNavbar } from "@/components/navbar";
import { WatchlistTable } from "@/components/watchlist-components/table";
import { WatchlistGrid } from "@/components/watchlist-components/grid";
import { WatchlistItem } from "@/types/watchlistItem";
import { parse } from "date-fns";

export const Route = createFileRoute("/watchlist")({
	component: RouteComponent,
	// beforeLoad: async (context) => {
	// 	console.log("Watchlist beforeLoad");
	// 	const session = await authClient.getSession();
	// 	console.log("Watchlist session:", session);
	// 	if (!session?.data?.user) {
	// 		throw redirect({to: "/signin" });
	// 	}
	// }
});

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
	{
		wishlistId: "cmimoez9700002sumpo5tzj2r",
		userId: "MupawCBm3NrnG9FI5HdkmjhcSiNjcHdo",
		mediaItemId: 2,
		status: "PLAN_TO_WATCH",
		rating: "0",
		completedAt: null,
		comments: null,
		createdAt: "2025-12-01T04:55:57.667Z",
		updatedAt: "2025-12-01T04:55:57.667Z",
		mediaItem: {
			itemId: 2,
			title: "ATTACK ON TITAN",
			type: "ANIME",
			apiSource: "ANILIST",
			apiId: "100",
			metadata: {
				adult: false,
				video: false,
				overview: "EREN YEAGER",
				genre_ids: [18, 10749],
				popularity: 29.5103,
				vote_count: 26503,
				poster_path: "/wgwldDDlTDDMrluOMkpSA8lyKjv.jpg",
				release_date: "205-12-12",
				vote_average: 7.903,
				backdrop_path: "/xnHVX37XZEp33hhCbYlQFq7ux1J.jpg",
				original_title: "ATTACK ON TITAN",
				original_language: "en",
			},
			createdAt: "2025-12-01T04:55:57.667Z",
			updatedAt: "2025-12-01T04:55:57.667Z",
		},
	},
];

const cleanedWatchlistData: WatchlistItem[] = tempWatchlistData.map(mapToEnums);

function RouteComponent() {
	return (
		<div>
			<MyNavbar />
			<div className="container mx-auto my-8 max-w-[75%]">
				<h1 className="text-5xl font-bold mb-4">My Watchlist</h1>
				{/* <WatchlistTable /> */}
				<WatchlistGrid items={cleanedWatchlistData} />
			</div>
		</div>
	);
}
