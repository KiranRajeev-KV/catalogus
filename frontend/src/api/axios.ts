// frontend/src/api/axios.ts
import axios from "axios";
import type { SortBy, StatusFilter } from "@/stores/filtersStore";
import type { MediaType, MediaSearchResult } from "@/types/mediaItem";
import type { WatchlistStatus } from "@/types/watchlistItem";

const BASE_URL = "http://localhost:8080/api";

const api = axios.create({
	baseURL: BASE_URL,
	timeout: 10000,
	headers: { "Content-Type": "application/json" },
	withCredentials: true,
});

export default api;

export type ApiErrorCode =
	| "VALIDATION_FAILED"
	| "UNAUTHORIZED"
	| "WATCHLIST_DUPLICATE"
	| "PROVIDER_RATE_LIMITED"
	| "PROVIDER_UNAVAILABLE"
	| "PROVIDER_BAD_CONFIG"
	| "PROVIDER_BAD_RESPONSE"
	| "FALLBACK_ONLY_RESULTS"
	| "INTERNAL_ERROR";

export interface ApiErrorPayload {
	code: ApiErrorCode;
	message: string;
	retryable: boolean;
	provider?: "TMDB" | "ANILIST";
	retryAttempts?: number | null;
	retryAfterMs?: number | null;
	suggestedBackoffMs?: number | null;
	upstreamStatus?: number | null;
	fallbackAvailable?: boolean;
	details?: unknown;
}

export interface MediaSearchResponse {
	data: {
		results: MediaSearchResult[];
	} | null;
	meta?: {
		pagination?: {
			limit: number;
			nextCursor: string | null;
			hasMore: boolean;
		};
		provider?: {
			primary?: "TMDB" | "ANILIST";
			servedBy?: "TMDB" | "ANILIST" | "LOCAL_DB";
			fallbackUsed?: boolean;
			fallbackSource?: "LOCAL_DB" | null;
			fallbackReasonCode?: ApiErrorCode;
		};
	};
	error: ApiErrorPayload | null;
}

export type AddWatchlistPayload = {
	apiId: string;
	type: MediaType;
	status?: WatchlistStatus;
	rating?: number;
	comments?: string;
};

export interface AddWatchlistErrorResponse {
	error?: ApiErrorPayload;
}

export async function fetchWatchlist(
	page: number,
	limit?: number,
	status?: StatusFilter,
	type?: MediaType,
	sort?: SortBy,
	q?: string,
	signal?: AbortSignal,
) {
	const response = await api.get("/watchlist", {
		params: {
			page: page,
			limit: limit,
			status: status,
			type: type,
			sort: sort,
			q: q,
		},
		signal,
	});
	return response.data;
}

export async function searchMedia(
	type: MediaType,
	query: string,
	includeAdult = false,
	cursor?: string | null,
	limit = 20,
	signal?: AbortSignal,
): Promise<MediaSearchResponse> {
	const response = await api.get("/media/search", {
		params: {
			type,
			q: query,
			includeAdult,
			cursor: cursor || undefined,
			limit,
		},
		signal,
	});
	return response.data;
}

export const addItemToWatchlist = async (data: AddWatchlistPayload) => {
	const response = await api.post("/watchlist", data);
	return response.data;
};

export const updateWatchlistItem = async (
	wishlistId: string,
	updatedStatus?: StatusFilter,
	updatedRating?: number,
	updatedComments?: string,
) => {
	const response = await api.patch(`/watchlist/${wishlistId}`, {
		status: updatedStatus,
		rating: updatedRating,
		comments: updatedComments,
	});
	return response.data;
};

export const deleteWatchlistItem = async (wishlistId: string) => {
	const response = await api.delete(`/watchlist/${wishlistId}`);
	return response.data;
};
