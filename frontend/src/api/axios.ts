// frontend/src/api/axios.ts
import axios from "axios";
import type { SortBy, StatusFilter } from "@/stores/filtersStore";
import type { MediaType } from "@/types/mediaItem";

const BASE_URL = "http://localhost:8080/api";

const api = axios.create({
	baseURL: BASE_URL,
	timeout: 10000,
	headers: { "Content-Type": "application/json" },
	withCredentials: true,
});

export default api;

export async function fetchWatchlist(
	page: number,
	limit?: number,
	status?: StatusFilter,
	type?: MediaType,
	sort?: SortBy,
	q?: string,
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
	});
	return response.data;
}

export async function searchMedia(type: MediaType, query: string) {
	const response = await api.get("/media/search", {
		params: {
			type: type,
			q: query,
		},
	});
	return response.data;
}

export const addItemToWatchlist = async (data: {
	apiId: string;
	type: MediaType;
	status: StatusFilter;
}) => {
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
