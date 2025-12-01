import { ColumnDef } from "@tanstack/react-table";
import type { WatchlistItem } from "@/types/watchlistItem";
import { format } from "date-fns";
import { Star } from "lucide-react";
import { WatchlistStatus } from "@/types/watchlistItem";

export const columns: ColumnDef<WatchlistItem>[] = [
	{
		id: "poster",
		header: "Poster",
		cell: ({ row }) => {
			const posterPath = row.original.mediaItem.metadata.poster_path;
			return (
				<img
					src={`https://image.tmdb.org/t/p/w92${posterPath}`}
					alt={row.original.mediaItem.title}
					className="rounded-md shadow-md"
				/>
			);
		},
	},
	{
		id: "title",
		header: "Title",
		cell: ({ row }) => {
			const title = row.original.mediaItem.title;
			const overview =
				row.original.mediaItem.metadata.overview?.slice(0, 80) + "...";
			const release_date = row.original.mediaItem.metadata.release_date
				? format(new Date(row.original.mediaItem.metadata.release_date), "yyyy")
				: undefined;
			const apiRating = row.original.mediaItem.metadata.vote_average || 0;
			return (
				<div className="flex flex-col gap-1">
					<div className="flex flex-row items-center align-middle gap-1 text-lg">
						<span className="text-lg font-medium">{title}</span>
						<span>({release_date})</span>
					</div>
					<div>
						<span className="text-sm text-muted-foreground">{overview}</span>
					</div>
					{/* TODO: MAYBE ADD A TOOLTIP OF WHERE THIS RATING IS FROM (TMDB, TVMB, ANILIST, MDL) */}
					<div className="rounded-md text-foreground bg-primary text-sm font-semibold px-2 py-1 w-fit mt-1 flex items-center">
						<Star className="inline-block mr-1 h-4 w-4" />
						{apiRating.toFixed(1)}
					</div>
				</div>
			);
		},
	},
	{
		id: "status",
		header: "Status",
		cell: ({ row }) => {
			const status = row.original.status as WatchlistStatus;
			console.log("Rendering status:", status);
			return (
				<span className="font-medium">
					{String(status)
						.replace(/_/g, " ")
						.toLowerCase()
						.replace(/\b\w/g, (c) => c.toUpperCase())}
				</span>
			);
		},
	},
];
