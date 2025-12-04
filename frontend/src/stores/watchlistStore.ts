// frontend/src/stores/watchlistStore.ts
import { create } from "zustand";
import type { WatchlistItem } from "@/types/watchlistItem";

interface WatchlistState {
	watchlist: WatchlistItem[];
	paginationDetails: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
	setPaginationDetails: (details: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	}) => void;
	setWatchlist: (items: WatchlistItem[]) => void;
}
export const useWatchlistStore = create<WatchlistState>((set) => ({
	watchlist: [],
	paginationDetails: {
		total: 0,
		page: 0,
		limit: 0,
		totalPages: 0,
	},
	setPaginationDetails: (details) => set({ paginationDetails: details }),
	setWatchlist: (items: WatchlistItem[]) => set({ watchlist: items }),
}));
