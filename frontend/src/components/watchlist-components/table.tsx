import { format, formatDistanceToNowStrict } from "date-fns";
import {
	Calendar,
	Clock3,
	Film,
	Globe2,
	ListChecks,
	Star,
	Tv,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { WatchlistItem } from "@/types/watchlistItem";

interface WatchlistTableProps {
	items: WatchlistItem[];
}

const TYPE_ICON = {
	MOVIE: Film,
	TV: Tv,
	ANIME: Tv,
} as const;

const STATUS_STYLE: Record<WatchlistItem["status"], string> = {
	PLAN_TO_WATCH:
		"bg-secondary text-secondary-foreground border-transparent",
	WATCHING: "bg-blue-500 text-white border-transparent",
	COMPLETED: "bg-green-500 text-white border-transparent",
	ON_HOLD: "bg-yellow-500 text-black border-transparent",
	DROPPED: "bg-red-500 text-white border-transparent",
};

const SOURCE_STYLE: Record<WatchlistItem["mediaItem"]["apiSource"], string> = {
	TMDB: "bg-blue-500/15 text-blue-500 border-blue-500/30",
	TVDB: "bg-indigo-500/15 text-indigo-500 border-indigo-500/30",
	ANILIST: "bg-cyan-500/15 text-cyan-500 border-cyan-500/30",
};

const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w92";

function getPosterUrl(posterPath: string | null) {
	if (!posterPath) return null;
	if (posterPath.startsWith("http://") || posterPath.startsWith("https://")) {
		return posterPath;
	}
	return `${TMDB_IMAGE_BASE_URL}${posterPath}`;
}

function formatStatus(status: WatchlistItem["status"]) {
	return status
		.replace(/_/g, " ")
		.toLowerCase()
		.replace(/\b\w/g, (c) => c.toUpperCase());
}

function getRuntime(item: WatchlistItem) {
	const { type, metadata } = item.mediaItem;
	if (type === "MOVIE" && metadata.runtime) return `${metadata.runtime}m`;
	if ((type === "TV" || type === "ANIME") && metadata.episodeRunTime?.[0]) {
		return `${metadata.episodeRunTime[0]}m/ep`;
	}
	return "-";
}

function formatScore(score: number | null | undefined) {
	if (typeof score !== "number" || Number.isNaN(score) || score <= 0) return "-";
	return score.toFixed(1);
}

export function WatchlistTable({ items }: WatchlistTableProps) {
	const totalItems = items.length;
	const completedCount = items.filter((i) => i.status === "COMPLETED").length;
	const watchingCount = items.filter((i) => i.status === "WATCHING").length;
	const plannedCount = items.filter((i) => i.status === "PLAN_TO_WATCH").length;
	const avgUserScoreItems = items.filter(
		(i) => typeof i.rating === "number" && i.rating > 0,
	);
	const avgUserScore =
		avgUserScoreItems.length > 0
			? (
					avgUserScoreItems.reduce((acc, curr) => acc + curr.rating, 0) /
					avgUserScoreItems.length
				).toFixed(1)
			: "-";

	return (
		<div className="py-3 space-y-3">
			<div className="rounded-xl border border-border/70 bg-card px-4 py-3">
				<div className="flex flex-wrap items-center gap-2 text-xs">
					<Badge variant="outline" className="text-[11px]">
						<ListChecks className="h-3 w-3" />
						{totalItems} in list
					</Badge>
					<Badge variant="outline" className="text-[11px] bg-green-500/12 text-green-500 border-green-500/30">
						Completed {completedCount}
					</Badge>
					<Badge variant="outline" className="text-[11px] bg-blue-500/12 text-blue-500 border-blue-500/30">
						Watching {watchingCount}
					</Badge>
					<Badge variant="outline" className="text-[11px] bg-secondary text-secondary-foreground border-transparent">
						Planned {plannedCount}
					</Badge>
					<Badge variant="outline" className="text-[11px]">
						<Star className="h-3 w-3 text-amber-500 fill-amber-500/20" />
						Avg user score {avgUserScore}
					</Badge>
				</div>
			</div>

			<div className="rounded-xl border border-border/70 bg-card overflow-hidden">
				<div className="overflow-x-auto">
					<div className="min-w-[980px]">
						<div className="grid grid-cols-[minmax(400px,2.7fr)_minmax(190px,1.05fr)_minmax(185px,0.95fr)_minmax(150px,0.7fr)] items-center gap-x-2 px-4 py-3 text-xs text-muted-foreground/85 font-semibold border-b border-border/60 bg-card/95">
							<div>Media</div>
							<div>Tracking</div>
							<div>Metadata</div>
							<div className="text-right">Timeline</div>
						</div>

						{items.map((item) => {
							const { mediaItem } = item;
							const { metadata } = mediaItem;
							const TypeIcon = TYPE_ICON[mediaItem.type];
							const posterUrl = getPosterUrl(metadata.posterPath);
							const year = metadata.releaseDate
								? format(new Date(metadata.releaseDate), "yyyy")
								: "TBA";
							const addedAt = formatDistanceToNowStrict(new Date(item.createdAt), {
								addSuffix: true,
							});
							const userScore = formatScore(item.rating);
							const communityScore = formatScore(metadata.rating);
							const completedOn = item.completedAt
								? format(new Date(item.completedAt), "MMM d, yyyy")
								: null;
							const updatedAgo = formatDistanceToNowStrict(
								new Date(item.updatedAt),
								{ addSuffix: true },
							);
							const primaryGenre = metadata.genres?.[0] ?? null;
							const language = metadata.originalLanguage?.toUpperCase();
							const episodes = metadata.totalEpisodes
								? `${metadata.totalEpisodes} eps`
								: "-";

								return (
									<div
										key={item.wishlistId}
										className="group grid grid-cols-[minmax(400px,2.7fr)_minmax(190px,1.05fr)_minmax(185px,0.95fr)_minmax(150px,0.7fr)] items-start gap-x-2 px-4 py-3 border-b border-border/50 last:border-b-0 hover:bg-muted/35 transition-colors"
									>
										<div className="flex items-start gap-3 min-w-0">
											<div className="h-18 w-12 shrink-0 overflow-hidden rounded-md border bg-muted">
											{posterUrl ? (
												<img
													src={posterUrl}
													alt={mediaItem.title}
													className="h-full w-full object-cover"
													loading="lazy"
												/>
											) : (
												<div className="h-full w-full grid place-items-center text-muted-foreground">
													<TypeIcon className="h-4 w-4" />
												</div>
											)}
										</div>

										<div className="min-w-0 space-y-1.5">
											<div className="flex items-center gap-2 min-w-0">
												<p className="font-semibold leading-tight truncate">
													{mediaItem.title}
												</p>
												<span className="text-xs text-muted-foreground shrink-0">
													({year})
												</span>
											</div>
											<div className="flex items-center flex-wrap gap-1.5">
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
											{metadata.overview ? (
												<p className="text-xs text-muted-foreground line-clamp-1 group-hover:text-foreground/80 transition-colors">
													{metadata.overview}
												</p>
											) : null}
										</div>
									</div>

										<div className="space-y-2 pt-0.5">
											<Badge
												variant="outline"
												className={`font-medium ${STATUS_STYLE[item.status]} min-w-[120px] justify-center`}
										>
											{formatStatus(item.status)}
										</Badge>
										<div className="space-y-1">
											<div className="flex items-center gap-1.5 text-sm font-semibold tabular-nums">
												<Star className="h-4 w-4 text-amber-500 fill-amber-500/20" />
												<span>{userScore}</span>
												<span className="text-xs text-muted-foreground">your score</span>
											</div>
											<div className="text-xs text-muted-foreground tabular-nums">
												Community {communityScore}
											</div>
											</div>
										</div>

										<div className="space-y-1.5 text-xs text-muted-foreground pt-0.5">
											<div className="flex items-center gap-1.5">
												<Clock3 className="h-3.5 w-3.5" />
												<span>{getRuntime(item)}</span>
											<span>·</span>
											<span>{episodes}</span>
										</div>
										<div className="flex items-center gap-1.5">
											<Globe2 className="h-3.5 w-3.5" />
											<span>{language || "-"}</span>
											<span>·</span>
											<span>{metadata.voteCount ? `${metadata.voteCount.toLocaleString()} votes` : "-"}</span>
											</div>
										</div>

										<div className="space-y-1.5 text-xs text-muted-foreground pt-0.5 text-right">
											<div className="flex items-center justify-end gap-1.5">
												<Calendar className="h-3.5 w-3.5" />
												<span>Added {addedAt}</span>
											</div>
										<div>
											{completedOn ? `Completed ${completedOn}` : `Updated ${updatedAgo}`}
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</div>
	);
}
