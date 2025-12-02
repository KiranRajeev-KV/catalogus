import { create } from "zustand";
import type { WatchlistItem } from "@/types/watchlistItem";
import { fetchWatchlist } from "@/api/axios";
import type { SortBy, StatusFilter } from "./filtersStore";

interface WatchlistState {
	watchlist: WatchlistItem[];
}
export const useWatchlistStore = create<WatchlistState>((set) => ({
	watchlist: [],

	updateWatchlistItem: (updatedItem: WatchlistItem) => {
		set((state) => ({
			watchlist: state.watchlist.map((item) =>
				item.wishlistId === updatedItem.wishlistId ? updatedItem : item,
			),
		}));
	},

	fetchWatchlist: async (
		page: number,
		limit: number,
		sort: SortBy,
		status: StatusFilter,
		search?: string,
	) => {
		const data = await fetchWatchlist(page, limit, sort, status, search);
		set({ watchlist: data });
	},
}));
