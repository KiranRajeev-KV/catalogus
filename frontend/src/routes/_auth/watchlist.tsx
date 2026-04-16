// frontend/src/routes/_auth/watchlist.tsx
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";
import { fetchWatchlist } from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { WatchlistGrid } from "@/components/watchlist-components/grid";
import { WatchlistTable } from "@/components/watchlist-components/table";
import { WatchlistFilters } from "@/components/watchlist-components/watchlistFilters";
import { WatchlistPagination } from "@/components/watchlist-components/watchlistPagination";
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
		queryFn: ({ signal }) =>
			fetchWatchlist(
				filterStore.page,
				filterStore.limit,
				filterStore.status,
				filterStore.type,
				filterStore.sort,
				filterStore.q,
				signal,
			),
		placeholderData: keepPreviousData,
	});

	// biome-ignore lint/correctness/useExhaustiveDependencies: scroll to top on page change
	useEffect(() => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	}, [filterStore.page]);

	const isTable = filterStore.viewMode === "table";

	const LoadingState = () => (
		<div className="space-y-3 py-2">
			{Array.from({ length: isTable ? 8 : 6 }).map((_, idx) => (
				<Skeleton
					key={`watchlist-skeleton-${idx + 1}`}
					className={
						isTable ? "h-20 w-full rounded-xl" : "h-64 w-full rounded-xl"
					}
				/>
			))}
		</div>
	);

	if (isError)
		return (
			<div className="container mx-auto my-10 max-w-[75%]">
				<div className="rounded-xl border border-destructive/40 bg-destructive/10 p-5">
					<div className="flex items-center gap-2 text-destructive font-semibold">
						<AlertTriangle className="h-4 w-4" />
						Failed to load watchlist
					</div>
					<p className="mt-2 text-sm text-foreground/80">{error.message}</p>
					<Button
						className="mt-4"
						size="sm"
						onClick={() => window.location.reload()}
					>
						Retry
					</Button>
				</div>
			</div>
		);

	return (
		<div className="bg-linear-to-b from-background via-background to-muted/20">
			<div className="mx-auto my-6 max-w-[75%] rounded-2xl p-4 sm:my-8 sm:p-6">
				<h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
					My Watchlist
				</h1>
				<WatchlistFilters />

				{isFetching && (
					<div className="text-sm text-muted-foreground mb-2 animate-pulse">
						Updating...
					</div>
				)}

				{isLoading && <LoadingState />}

				{!isLoading && (!data?.data || data.data.length === 0) ? (
					<div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
						<p className="text-lg">Your watchlist is empty</p>
					</div>
				) : !isLoading ? (
					<>
						{isTable ? (
							<WatchlistTable items={data.data} />
						) : (
							<WatchlistGrid items={data.data} />
						)}

						<WatchlistPagination
							currentPage={data.pagination.page}
							totalPages={data.pagination.totalPages}
							onPageChange={(newPage) => filterStore.setPage(newPage)}
						/>
					</>
				) : null}
			</div>
		</div>
	);
}
