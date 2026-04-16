import type { ColumnDef } from "@tanstack/react-table";
import { format, formatDistanceToNowStrict } from "date-fns";
import { Calendar, Clock3, Film, Star, Tv } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { WatchlistItem, WatchlistStatus } from "@/types/watchlistItem";

const getPosterUrl = (posterPath: string | null) => {
	if (!posterPath) return "";
	if (posterPath.startsWith("http://") || posterPath.startsWith("https://")) {
		return posterPath;
	}
	return `https://image.tmdb.org/t/p/w92${posterPath}`;
};

const STATUS_STYLE: Record<WatchlistStatus, string> = {
	PLAN_TO_WATCH:
		"bg-secondary text-secondary-foreground border-transparent hover:bg-secondary/80",
	WATCHING: "bg-blue-500 text-white border-transparent hover:bg-blue-600",
	COMPLETED: "bg-green-500 text-white border-transparent hover:bg-green-600",
	ON_HOLD: "bg-yellow-500 text-black border-transparent hover:bg-yellow-600",
	DROPPED: "bg-red-500 text-white border-transparent hover:bg-red-600",
};

const SOURCE_STYLE: Record<WatchlistItem["mediaItem"]["apiSource"], string> = {
	TMDB: "bg-blue-500/15 text-blue-500 border-blue-500/30",
	TVDB: "bg-indigo-500/15 text-indigo-500 border-indigo-500/30",
	ANILIST: "bg-cyan-500/15 text-cyan-500 border-cyan-500/30",
};

const TYPE_ICON = {
	MOVIE: Film,
	TV: Tv,
	ANIME: Tv,
} as const;

function formatStatus(status: WatchlistStatus) {
	return status
		.replace(/_/g, " ")
		.toLowerCase()
		.replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatRuntime(row: WatchlistItem) {
	const { type, metadata } = row.mediaItem;
	if (type === "MOVIE" && metadata.runtime) {
		return `${metadata.runtime}m`;
	}
	if ((type === "TV" || type === "ANIME") && metadata.episodeRunTime?.[0]) {
		return `${metadata.episodeRunTime[0]}m/ep`;
	}
	return "—";
}

export const columns: ColumnDef<WatchlistItem>[] = [
	{
		id: "title",
		header: "Title",
		cell: ({ row }) => {
			const item = row.original;
			const { mediaItem } = item;
			const { metadata } = mediaItem;
			const TypeIcon = TYPE_ICON[mediaItem.type];
			const posterPath = metadata.posterPath;
			const year = metadata.releaseDate
				? format(new Date(metadata.releaseDate), "yyyy")
				: "TBA";
			const primaryGenre = metadata.genres?.[0];

			return (
				<div className="flex items-start gap-3 min-w-[320px] max-w-[460px]">
					<div className="h-16 w-12 shrink-0 overflow-hidden rounded-md border bg-muted">
						{posterPath ? (
							<img
								src={getPosterUrl(posterPath)}
								alt={mediaItem.title}
								className="h-full w-full object-cover"
							/>
						) : (
							<div className="h-full w-full grid place-items-center text-muted-foreground">
								<TypeIcon className="h-4 w-4" />
							</div>
						)}
					</div>

					<div className="space-y-1">
						<div className="flex items-center gap-2">
							<p className="font-semibold leading-tight line-clamp-1">{mediaItem.title}</p>
							<span className="text-xs text-muted-foreground shrink-0">({year})</span>
						</div>

						<div className="flex flex-wrap items-center gap-1.5">
							<Badge variant="outline" className="text-[11px]">
								<TypeIcon className="h-3 w-3" />
								{mediaItem.type}
							</Badge>
							<Badge
								variant="outline"
								className={`text-[11px] ${SOURCE_STYLE[mediaItem.apiSource]}`}
							>
								{mediaItem.apiSource}
							</Badge>
							{primaryGenre ? (
								<Badge variant="outline" className="text-[11px]">
									{primaryGenre}
								</Badge>
							) : null}
						</div>
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
			return (
				<Badge
					variant="outline"
					className={`font-medium ${STATUS_STYLE[status]} min-w-[120px] justify-center`}
				>
					{formatStatus(status)}
				</Badge>
			);
		},
	},
	{
		id: "score",
		header: "Score",
		cell: ({ row }) => {
			const userScore = row.original.rating;
			const externalScore = row.original.mediaItem.metadata.rating;

			return (
				<div className="flex items-center gap-1.5 text-sm font-semibold tabular-nums min-w-[130px]">
					<Star className="h-4 w-4 text-amber-500 fill-amber-500/20" />
					<span>{typeof userScore === "number" ? userScore.toFixed(1) : "—"}</span>
					<span className="text-xs text-muted-foreground">
						/ {typeof externalScore === "number" ? externalScore.toFixed(1) : "—"}
					</span>
				</div>
			);
		},
	},
	{
		id: "details",
		header: "Details",
		cell: ({ row }) => {
			const runtime = formatRuntime(row.original);
			const episodes = row.original.mediaItem.metadata.totalEpisodes ?? null;

			return (
				<div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-[130px]">
					<Clock3 className="h-3.5 w-3.5" />
					<span>{runtime}</span>
					<span>·</span>
					<span>{episodes ? `${episodes} eps` : "-"}</span>
				</div>
			);
		},
	},
	{
		id: "activity",
		header: "Activity",
		cell: ({ row }) => {
			const createdAt = new Date(row.original.createdAt);
			return (
				<div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-[175px]">
					<Calendar className="h-3.5 w-3.5" />
					<span>Added {formatDistanceToNowStrict(createdAt, { addSuffix: true })}</span>
				</div>
			);
		},
	},
];
