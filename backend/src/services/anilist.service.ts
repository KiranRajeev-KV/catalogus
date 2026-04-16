import axios from "axios";
import axiosRetry from "axios-retry";
import { ApiSource, Type } from "../generated/prisma/client.js";
import type { AniListDetailMedia, AniListSearchMedia } from "../types/anilist.js";
import { cache } from "./cache.service.js";
import { toIntegrationError } from "../lib/integration-error.js";

const ANILIST_BASE_URL =
	process.env.ANILIST_API_URL?.trim() || "https://graphql.anilist.co";
const ANILIST_TIMEOUT_MS = 10000;
const SEARCH_PAGE_SIZE = 20;
const CACHE_TTL_SECONDS = 86400;

const anilist = axios.create({
	baseURL: ANILIST_BASE_URL,
	timeout: ANILIST_TIMEOUT_MS,
	headers: {
		"Content-Type": "application/json",
		Accept: "application/json",
	},
});

axiosRetry(anilist, {
	retries: 3,
	retryDelay: (retryCount, error) => {
		const retryAfterHeader = error.response?.headers?.["retry-after"];
		const parsedRetryAfter = Number(retryAfterHeader);
		if (!Number.isNaN(parsedRetryAfter) && parsedRetryAfter > 0) {
			return parsedRetryAfter * 1000;
		}
		return axiosRetry.exponentialDelay(retryCount);
	},
	retryCondition: (error) => {
		if (axiosRetry.isNetworkError(error)) {
			return true;
		}
		return error.response?.status === 429;
	},
});

const SEARCH_ANIME_QUERY = `
query SearchAnime($search: String!, $page: Int!, $perPage: Int!) {
  Page(page: $page, perPage: $perPage) {
    pageInfo {
      hasNextPage
    }
    media(search: $search, type: ANIME, sort: POPULARITY_DESC) {
      id
      isAdult
      averageScore
      popularity
      episodes
      duration
      title {
        english
        romaji
        native
      }
      coverImage {
        large
        medium
      }
      startDate {
        year
        month
        day
      }
    }
  }
}
`;

const ANIME_DETAIL_QUERY = `
query AnimeDetails($id: Int!) {
  Media(id: $id, type: ANIME) {
    id
    title {
      english
      romaji
      native
    }
    description(asHtml: false)
    genres
    episodes
    duration
    averageScore
    status
    startDate {
      year
      month
      day
    }
    endDate {
      year
      month
      day
    }
    bannerImage
    coverImage {
      large
      medium
    }
    studios(isMain: true) {
      nodes {
        name
      }
    }
    trailer {
      id
      site
      thumbnail
    }
  }
}
`;

function getCanonicalTitle(media: { title: { english: string | null; romaji: string | null; native: string | null } }) {
	return media.title.english || media.title.romaji || media.title.native || "Untitled";
}

function assertAniListSuccess(response: { data?: { errors?: Array<{ message?: string }> } }) {
	const errors = response.data?.errors;
	if (Array.isArray(errors) && errors.length > 0) {
		const errorMessage = errors
			.map((error: { message?: string }) => error.message || "Unknown AniList error")
			.join("; ");
		throw new Error(errorMessage);
	}
}

function formatAniListDate(date: {
	year: number | null;
	month: number | null;
	day: number | null;
}): string | null {
	if (!date.year) {
		return null;
	}

	const month = date.month ?? 1;
	const day = date.day ?? 1;
	return `${date.year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function sanitizeDescription(description: string | null): string | null {
	if (!description) {
		return null;
	}
	return description.replace(/\r\n/g, "\n").trim();
}

export async function searchAniListAnime(
	query: string,
	page = 1,
	limit = SEARCH_PAGE_SIZE,
	includeAdult = false,
) {
	const cacheKey = `search:ANIME:${includeAdult ? "all" : "safe"}:${query
		.toLowerCase()
		.trim()}:${page}:${limit}`;
	try {
		const cachedResult = await cache.get(cacheKey);
		if (cachedResult) {
			console.log(`[CACHE HIT] Serving anime search "${query}" from Redis`);
			if (Array.isArray(cachedResult)) {
				return {
					results: cachedResult,
					hasNextPage: cachedResult.length > 0,
				};
			}
			if (
				typeof cachedResult === "object" &&
				cachedResult !== null &&
				Array.isArray((cachedResult as { results?: unknown }).results)
			) {
				return {
					results: (cachedResult as { results: unknown[] }).results,
					hasNextPage: Boolean(
						(cachedResult as { hasNextPage?: boolean }).hasNextPage,
					),
				};
			}
		}

		console.log(`[CACHE MISS] Fetching anime search "${query}" from AniList`);
		const response = await anilist.post("", {
			query: SEARCH_ANIME_QUERY,
			variables: {
				search: query,
				page,
				perPage: limit,
			},
		});
		assertAniListSuccess(response);

		const rawResults: AniListSearchMedia[] = response.data?.data?.Page?.media || [];
		const hasNextPage = Boolean(response.data?.data?.Page?.pageInfo?.hasNextPage);
		const filteredResults = includeAdult
			? rawResults
			: rawResults.filter((media) => !media.isAdult);

		const structuredResults = filteredResults.map((media) => ({
			title: getCanonicalTitle(media),
			apiSource: ApiSource.ANILIST,
			apiId: media.id.toString(),
			type: Type.ANIME,
			poster_path: media.coverImage.large || media.coverImage.medium,
			release_date: formatAniListDate(media.startDate),
			community_rating: media.averageScore ? media.averageScore / 10 : null,
			vote_count: null,
			popularity: media.popularity ?? null,
			total_episodes: media.episodes ?? null,
			episode_runtime: media.duration ?? null,
		}));

		const payload = {
			results: structuredResults,
			hasNextPage,
		};

		await cache.set(cacheKey, payload, CACHE_TTL_SECONDS);

		return payload;
	} catch (error) {
		throw toIntegrationError("ANILIST", "search", error);
	}
}

export async function getAniListAnimeDetails(apiId: string) {
	const numericId = Number(apiId);
	if (!Number.isInteger(numericId) || numericId <= 0) {
		return null;
	}

	const cacheKey = `anime:${apiId}`;
	try {
		const cachedResult = await cache.get(cacheKey);
		if (cachedResult) {
			console.log(`[CACHE HIT] Serving anime ID "${apiId}" from Redis`);
			return cachedResult;
		}

		console.log(`[CACHE MISS] Fetching anime ID "${apiId}" from AniList`);
		const response = await anilist.post("", {
			query: ANIME_DETAIL_QUERY,
			variables: {
				id: numericId,
			},
		});
		assertAniListSuccess(response);

		const media: AniListDetailMedia | undefined = response.data?.data?.Media;
		if (!media) {
			return null;
		}

		const structuredDetails = {
			title: getCanonicalTitle(media),
			type: Type.ANIME,
			apiSource: ApiSource.ANILIST,
			apiId: media.id.toString(),
			metadata: {
				posterPath: media.coverImage.large || media.coverImage.medium,
				releaseDate: formatAniListDate(media.startDate),
				genres: media.genres || [],
				overview: sanitizeDescription(media.description),
				episodeRunTime: media.duration ? [media.duration] : null,
				rating: media.averageScore ? media.averageScore / 10 : null,
				backdropPath: media.bannerImage,
				status: media.status,
				totalEpisodes: media.episodes,
				endDatate: formatAniListDate(media.endDate),
				studios: media.studios?.nodes?.map((studio) => studio.name) || [],
				trailer: media.trailer,
				titleVariants: media.title,
			},
		};

		await cache.set(cacheKey, structuredDetails, CACHE_TTL_SECONDS);

		return structuredDetails;
	} catch (error) {
		throw toIntegrationError("ANILIST", "details", error);
	}
}
