import { create } from "zustand";
import type { MediaType } from "@/types/mediaItem";
import type { WatchlistStatus } from "@/types/watchlistItem";

type TypeFilter = "" | MediaType;
type StatusFilter = "" | WatchlistStatus;
type SortBy =
	| "latest"
	| "oldest"
	| "score_high"
	| "score_low"
	| "title_az"
	| "title_za";

interface FiltersState {
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
	searchQuery: "",
	setSearchQuery: (query) => {
		set({ searchQuery: query });
	},

	typeFilter: "",
	setTypeFilter: (type) => {
		set({ typeFilter: type });
	},

	statusFilter: "",
	setStatusFilter: (status) => {
		set({ statusFilter: status });
	},

	sortBy: "latest",
	setSortBy: (sortBy) => {
		set({ sortBy });
	},
}));

export default useFilters;
