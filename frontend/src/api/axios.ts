import axios from "axios";
import type { SortBy, StatusFilter } from "@/stores/filtersStore";

const BASE_URL = "http://localhost:8080/api";

const api = axios.create({
	baseURL: BASE_URL,
	timeout: 1000,
	headers: { "Content-Type": "application/json" },
	withCredentials: true,
});

export default api;

export function fetchWatchlist(
	page: number,
	limit: number,
	sort: SortBy,
	status: StatusFilter,
	_search?: string,
) {
	return api
		.get("/wishlist", {
			params: {
				page,
				limit,
				sort,
				status,
			},
		})
		.then((response) => response.data)
		.catch((error) => {
			console.error("Error fetching watchlist:", error);
			return [];
		});
}
