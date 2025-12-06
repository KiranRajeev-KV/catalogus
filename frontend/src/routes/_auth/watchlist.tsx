// frontend/src/routes/_auth/watchlist.tsx

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { fetchWatchlist } from "@/api/axios";
import { MyNavbar } from "@/components/navbar";
import { WatchlistGrid } from "@/components/watchlist-components/grid";
import { WatchlistFilters } from "@/components/watchlist-components/watchlistFilters";
import useFilters from "@/stores/filtersStore";

export const Route = createFileRoute("/_auth/watchlist")({
	component: Watchlist,
});

function Watchlist() {
	const filterStore = useFilters();

	const filterParams = {
		page: filterStore.page,
		limit: filterStore.limit,
		status: filterStore.status,
		type: filterStore.type,
		sort: filterStore.sort,
		q: filterStore.q,
	};

	const { data, isLoading, isError, error, isFetching } = useQuery({
		queryKey: ["watchlist", filterParams],
		queryFn: () =>
			fetchWatchlist(
				filterStore.page,
				filterStore.limit,
				filterStore.status,
				filterStore.type,
				filterStore.sort,
				filterStore.q,
			),
		placeholderData: keepPreviousData,
	});

	if (isError)
		return (
			<div className="items-center align-middle">
				Error loading watchlist: {error.message}
			</div>
		);
	if (isLoading)
		return (
			<div className="flex h-screen items-center justify-center">
				<Loader2 className="animate-spin" />
			</div>
		);

	return (
		<div>
			<MyNavbar />
			<div className="container mx-auto my-8 max-w-[75%]">
				<h1 className="text-5xl font-bold mb-4">My Watchlist</h1>
				<WatchlistFilters />
				{isFetching && (
					<div className="text-sm text-muted-foreground mb-2">Updating...</div>
				)}

				{!data?.data || data.data.length === 0 ? (
					<p className="text-lg">Your watchlist is empty</p>
				) : (
					<WatchlistGrid items={data.data} />
				)}
			</div>
		</div>
	);
}
