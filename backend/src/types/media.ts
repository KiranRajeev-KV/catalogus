// src/types/media.ts
import type { ApiSource, Status, Type } from "../generated/prisma/client.js";

export interface AddToWishlistDto {
	status: Status;
	media_item: {
		title: string;
		type: Type;
		api_source: ApiSource;
		api_id: string;
		metadata?: object;
	};
}

export interface UpdateWishlistDto {
	status?: Status;
	rating?: number;
	comments?: string;
}

export interface UpdateMediaItemDto {
	title?: string;
	metadata?: object;
	type?: Type;
}
