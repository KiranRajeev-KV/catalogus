import { createFileRoute } from "@tanstack/react-router";
import { MyNavbar } from "@/components/navbar";
import { WatchlistGrid } from "@/components/watchlist-components/grid";
import { WatchlistFilters } from "@/components/watchlist-components/watchlistFilters";
import type { WatchlistItem } from "@/types/watchlistItem";
import { tempWatchlistData } from "@/mocks/watchlistData";

export const Route = createFileRoute("/_auth/watchlist")({
	component: Watchlist,
});

const cleanedWatchlistData: WatchlistItem[] = tempWatchlistData;

function Watchlist() {
	return (
		<div>
			<MyNavbar />
			<div className="container mx-auto my-8 max-w-[75%]">
				<h1 className="text-5xl font-bold mb-4">My Watchlist</h1>
				<WatchlistFilters />
				{/* <WatchlistTable /> */}
				<WatchlistGrid items={cleanedWatchlistData} />
			</div>
		</div>
	)
}
