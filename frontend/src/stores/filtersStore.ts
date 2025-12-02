import { create } from "zustand";
import type { MediaType } from "@/types/mediaItem";
import type { WatchlistStatus } from "@/types/watchlistItem";

export type TypeFilter = "" | MediaType;
export type StatusFilter = "" | WatchlistStatus;
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

	searchQuery: string;
	setSearchQuery: (query: string) => void;

	typeFilter: TypeFilter;
	setTypeFilter: (type: TypeFilter) => void;

	statusFilter: StatusFilter;
	setStatusFilter: (status: StatusFilter) => void;

	sortBy: SortBy;
	setSortBy: (sortBy: SortBy) => void;
}

const useFilters = create<FiltersState>((set) => ({
	page: 1,
	setPage: (page) => {
		set({ page });
	},

	limit: 10,
	setLimit: (limit) => {
		set({ page: 1, limit });
	},

	searchQuery: "",
	setSearchQuery: (query) => {
		set({ searchQuery: query });
	},

	typeFilter: "",
	setTypeFilter: (type) => {
		set({ page: 1, typeFilter: type });
	},

	statusFilter: "",
	setStatusFilter: (status) => {
		set({ page: 1, statusFilter: status });
	},

	sortBy: "latest",
	setSortBy: (sortBy) => {
		set({ page: 1, sortBy });
	},
}));

export default useFilters;
