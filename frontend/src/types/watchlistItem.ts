import { MediaItem } from "./mediaItem";

export type WatchlistStatus =
	| "PLAN_TO_WATCH"
	| "WATCHING"
	| "COMPLETED"
	| "ON_HOLD"
	| "DROPPED";

export interface WatchlistItem {
	wishlistId: string;
	userId: string;
	mediaItemId: number;
	status: WatchlistStatus;
	rating: number;
	completedAt?: string | null;
	comments?: string | null;
	createdAt: string;
	updatedAt: string;
	mediaItem: MediaItem;
}
