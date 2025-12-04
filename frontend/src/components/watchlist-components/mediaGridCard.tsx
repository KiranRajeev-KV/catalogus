import type { WatchlistItem } from "@/types/watchlistItem";
import { Card } from "../ui/card";

interface MediaGridCardProps {
	item: WatchlistItem;
}

const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

export function MediaGridCard({ item }: MediaGridCardProps) {
	return (
		<Card className="relative border p-0 gap-0 shadow-md overflow-hidden hover:outline-2 hover:outline-offset-2 hover:outline-accent transition-all ease-in-out">
			<div>
				{/* TYPE */}
				<div className="absolute top-2 left-2 z-20 bg-popover text-popover-foreground text-xs px-2 py-1 rounded-md">
					{item.mediaItem.type}
				</div>
				{/* Status badge */}
				<div className="absolute top-2 right-2 z-20 bg-popover text-popover-foreground text-xs px-2 py-1 rounded-md">
					{item.status}
				</div>
			</div>

			{/* Poster image */}
			<div className="rounded-lg overflow-hidden shadow-md hover:scale-105 hover:duration-300 transition-transform">
				<img
					src={`${TMDB_IMAGE_BASE_URL}${item.mediaItem.metadata.posterPath}`}
					alt={item.mediaItem.title}
					className="w-full h-88 object-cover"
				/>
			</div>

			{/* Title + year */}
			<div className="pt-2 pb-2 px-4 flex flex-col">
				<h2 className="text-lg font-semibold truncate">
					{item.mediaItem.title}
				</h2>
				<p className="text-md text-muted-foreground">
					{item.mediaItem.metadata.releaseDate
						? new Date(item.mediaItem.metadata.releaseDate).getFullYear()
						: "Release date unknown"}
				</p>
			</div>
		</Card>
	);
}
