import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MediaType } from "@/types/mediaItem";
import type { WatchlistStatus } from "@/types/watchlistItem";

export type TypeFilter = MediaType | undefined;
export type StatusFilter = WatchlistStatus | undefined;
export type ViewMode = "grid" | "table";
export type SortBy =
	| "latest"
	| "oldest"
	| "score_high"
	| "score_low"
	| "title_az"
	| "title_za";

interface FiltersState {
	page: number;
	setPage: (page: number) => void;

	limit: number;
	setLimit: (limit: number) => void;

	q: string | undefined;
	setSearchQuery: (query: string | undefined) => void;

	type: TypeFilter;
	setTypeFilter: (type: TypeFilter) => void;

	status: StatusFilter;
	setStatusFilter: (status: StatusFilter) => void;

	sort: SortBy;
	setSortBy: (sort: SortBy) => void;

	viewMode: ViewMode;
	setViewMode: (viewMode: ViewMode) => void;
}

const useFilters = create<FiltersState>()(
	persist(
		(set) => ({
			page: 1,
			setPage: (page) => {
				set({ page });
			},

			limit: 10,
			setLimit: (limit) => {
				set({ page: 1, limit });
			},

			q: undefined,
			setSearchQuery: (query) => {
				set({ page: 1, q: query });
			},

			type: undefined,
			setTypeFilter: (type) => {
				set({ page: 1, type: type });
			},

			status: undefined,
			setStatusFilter: (status) => {
				set({ page: 1, status: status });
			},

			sort: "latest",
			setSortBy: (sort) => {
				set({ page: 1, sort: sort });
			},

			viewMode: "grid",
			setViewMode: (viewMode) => {
				set({ viewMode });
			},
		}),
		{
			name: "watchlist-view-mode",
			partialize: (state) => ({ viewMode: state.viewMode }),
		},
	),
);

export default useFilters;
