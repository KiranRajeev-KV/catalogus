import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MediaType } from "@/types/mediaItem";
import type { WatchlistStatus } from "@/types/watchlistItem";

export type SearchResultDensity = "compact" | "detailed";

export interface RecentSearchEntry {
	query: string;
	type: MediaType;
	includeAdult: boolean;
	at: number;
}

export interface RecentAddedEntry {
	apiId: string;
	title: string;
	type: MediaType;
	apiSource: "TMDB" | "ANILIST";
	at: number;
}

type SearchUiState = {
	lastType: MediaType;
	includeAdult: boolean;
	resultDensity: SearchResultDensity;
	lastStatus: WatchlistStatus;
	recentSearches: RecentSearchEntry[];
	recentAdded: RecentAddedEntry[];
	setLastType: (value: MediaType) => void;
	setIncludeAdult: (value: boolean) => void;
	setResultDensity: (value: SearchResultDensity) => void;
	setLastStatus: (value: WatchlistStatus) => void;
	pushRecentSearch: (entry: Omit<RecentSearchEntry, "at">) => void;
	pushRecentAdded: (entry: Omit<RecentAddedEntry, "at">) => void;
};

const MAX_RECENT_SEARCHES = 8;
const MAX_RECENT_ADDED = 8;

const useSearchUiStore = create<SearchUiState>()(
	persist(
		(set) => ({
			lastType: "MOVIE",
			includeAdult: false,
			resultDensity: "compact",
			lastStatus: "PLAN_TO_WATCH",
			recentSearches: [],
			recentAdded: [],
			setLastType: (value) =>
				set((state) =>
					state.lastType === value ? state : { ...state, lastType: value },
				),
			setIncludeAdult: (value) =>
				set((state) =>
					state.includeAdult === value
						? state
						: { ...state, includeAdult: value },
				),
			setResultDensity: (value) =>
				set((state) =>
					state.resultDensity === value
						? state
						: { ...state, resultDensity: value },
				),
			setLastStatus: (value) =>
				set((state) =>
					state.lastStatus === value ? state : { ...state, lastStatus: value },
				),
			pushRecentSearch: (entry) =>
				set((state) => {
					const deduped = state.recentSearches.filter(
						(item) =>
							!(
								item.query.toLowerCase() === entry.query.toLowerCase() &&
								item.type === entry.type &&
								item.includeAdult === entry.includeAdult
							),
					);
					return {
						recentSearches: [
							{ ...entry, at: Date.now() },
							...deduped,
						].slice(0, MAX_RECENT_SEARCHES),
					};
				}),
			pushRecentAdded: (entry) =>
				set((state) => {
					const deduped = state.recentAdded.filter(
						(item) =>
							!(
								item.apiId === entry.apiId &&
								item.apiSource === entry.apiSource &&
								item.type === entry.type
							),
					);
					return {
						recentAdded: [{ ...entry, at: Date.now() }, ...deduped].slice(
							0,
							MAX_RECENT_ADDED,
						),
					};
				}),
		}),
		{
			name: "watchlist-search-ui",
		},
	),
);

export default useSearchUiStore;
