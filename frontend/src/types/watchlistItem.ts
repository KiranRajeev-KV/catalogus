import { MediaItem } from "./mediaItem";

export interface WatchlistItem {
	wishlistId: string;
	userId: string;
	mediaItemId: number;
	status: "PLAN_TO_WATCH" | "WATCHING" | "COMPLETED" | "ON_HOLD" | "DROPPED";
	rating: number;
	completedAt?: string | null;
	comments?: string | null;
	createdAt: string;
	updatedAt: string;
	mediaItem: MediaItem;
}
