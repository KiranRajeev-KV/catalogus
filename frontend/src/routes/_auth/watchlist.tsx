// frontend/src/routes/_auth/watchlist.tsx
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { fetchWatchlist } from "@/api/axios";
import { WatchlistGrid } from "@/components/watchlist-components/grid";
import { WatchlistFilters } from "@/components/watchlist-components/watchlistFilters";
import useFilters from "@/stores/filtersStore";
import { useEffect } from "react";
import { WatchlistPagination } from "@/components/watchlist-components/watchlistPagination";

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

	useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [filterStore.page]);

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
            <div className="container mx-auto my-8 max-w-[75%]">
                <h1 className="text-5xl font-bold mb-4">My Watchlist</h1>
                <WatchlistFilters />
                
                {isFetching && (
                    <div className="text-sm text-muted-foreground mb-2 animate-pulse">Updating...</div>
                )}

                {!data?.data || data.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                        <p className="text-lg">Your watchlist is empty</p>
                    </div>
                ) : (
                    <>
                        <WatchlistGrid items={data.data} />
                        
                        <WatchlistPagination 
                            currentPage={data.pagination.page}
                            totalPages={data.pagination.totalPages}
                            onPageChange={(newPage) => filterStore.setPage(newPage)}
                        />
                    </>
                )}
            </div>
        </div>
	);
}
