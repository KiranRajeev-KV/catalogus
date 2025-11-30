import { MediaItem, Status } from "./mediaItem";

export interface WatchlistItem {
	wishlistId: string;
	userId: string;
	mediaItemId: number;
	status: Status;
	rating: number;
	completedAt?: string;
	comments?: string;
	createdAt: string;
	updatedAt: string;
	mediaItem: MediaItem;
}
