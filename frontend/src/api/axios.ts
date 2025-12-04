// frontend/src/api/axios.ts
import axios from "axios";
import type { SortBy, StatusFilter } from "@/stores/filtersStore";
import type { MediaType } from "@/types/mediaItem";

const BASE_URL = "http://localhost:8080/api";

const api = axios.create({
	baseURL: BASE_URL,
	timeout: 1000,
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
