// frontend/src/components/watchlist-components/mediaGridCard.tsx
import {
	Pencil,
	Trash2,
	Star,
	Calendar,
	Tv,
	Film,
	Dot,
	CircleCheckBig,
} from "lucide-react";
import type { WatchlistItem } from "@/types/watchlistItem";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "../ui/tooltip";

interface MediaGridCardProps {
	item: WatchlistItem;
	onEdit?: (id: number) => void;
	onDelete?: (id: number) => void;
}

const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

export function MediaGridCard({ item, onEdit, onDelete }: MediaGridCardProps) {
	const { mediaItem, status, rating } = item;
	const { metadata, title, type } = mediaItem;

	// Helper to color-code statuses
	const getStatusColor = (status: string) => {
		switch (status) {
			case "COMPLETED":
				return "bg-green-500 hover:bg-green-600";
			case "WATCHING":
				return "bg-blue-500 hover:bg-blue-600";
			case "DROPPED":
				return "bg-red-500 hover:bg-red-600";
			case "ON_HOLD":
				return "bg-yellow-500 hover:bg-yellow-600";
			default:
				return "bg-secondary text-secondary-foreground hover:bg-secondary/80"; // Plan to watch
		}
	};

	// Helper for formatting the status text (PLAN_TO_WATCH -> Plan To Watch)
	const formatStatus = (status: string) => {
		return status
			.split("_")
			.map((w) => w.charAt(0) + w.slice(1).toLowerCase())
			.join(" ");
	};

	return (
		<Card className="group relative border-none shadow-sm gap-4 hover:shadow-xl transition-all duration-300 overflow-hidden pt-0 pb-4">
			{/*POSTER IMAGE */}
			<div className="relative aspect-2/3 w-full overflow-hidden rounded-t-lg">
				{metadata.posterPath ? (
					<img
						src={`${TMDB_IMAGE_BASE_URL}${metadata.posterPath}`}
						alt={title}
						className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
						loading="lazy"
					/>
				) : (
					<div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
						No Poster
					</div>
				)}

				{/* Gradient Overlay */}
				<div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

				{/* Status Badge */}
				<div className="absolute top-2 left-2.5 z-10">
					<Badge
						className={`${getStatusColor(status)} shadow-sm border-none rounded-md py-1 px-2 text-xs font-medium`}
					>
						{formatStatus(status)}
					</Badge>
				</div>

				{/* Action Menu */}
				<div className="absolute bottom-4 left-1/2 -translate-x-1/2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 ease-in-out transition-all duration-300 z-20 w-[80%]">
					<div className="flex items-center justify-center gap-2 bg-black/30 backdrop-blur-md p-1.5 rounded-full shadow-xl">
						{/* Mark as Complete */}
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant="ghost"
										size="icon"
										className="h-8 w-8 rounded-full hover:bg-green-500/20 hover:text-green-400 text-white hover:scale-110 transition-colors"
										onClick={(e) => {
											e.stopPropagation();
											// TODO: Mark as complete action
										}}
									>
										<CircleCheckBig className="h-4 w-4" />
									</Button>
								</TooltipTrigger>
								<TooltipContent>
									<p>Mark Complete</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
						<div className="w-px h-4 bg-white/20" /> {/* Divider */}
						{/* Edit */}
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant="ghost"
										size="icon"
										className="h-8 w-8 rounded-full hover:bg-blue-500/20 text-white hover:text-blue-400 transition-colors hover:scale-110 ease-in-out"
										onClick={(e) => {
											e.stopPropagation();
											onEdit?.(item.mediaItemId);
										}}
									>
										<Pencil className="h-4 w-4" />
									</Button>
								</TooltipTrigger>
								<TooltipContent>
									<p>Edit</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
						{/* Delete */}
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant="ghost"
										size="icon"
										className="h-8 w-8 rounded-full hover:bg-red-500/20 hover:text-red-400 text-white transition-colors hover:scale-110 ease-in-out"
										onClick={(e) => {
											e.stopPropagation();
											onDelete?.(item.mediaItemId);
										}}
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</TooltipTrigger>
								<TooltipContent>
									<p>Delete</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					</div>
				</div>
			</div>

			{/* CONTENT SECTION */}
			<CardContent className="space-y-1.5 px-4">
				{/* Title */}
				<h3
					className="font-bold text-lg leading-tight line-clamp-1"
					title={title}
				>
					{title}
				</h3>

				{/* Metadata Row */}
				<div className="flex items-center justify-between text-xs text-muted-foreground">
					<div className="flex items-center gap-2">
						{/* Year */}
						<span className="flex items-center gap-1 text-base">
							<Calendar className="h-4 w-4" />
							{metadata.releaseDate
								? metadata.releaseDate.split("-")[0]
								: "TBA"}
						</span>

						<span className="flex items-center gap-1 text-base">
							<Dot className="h-4 w-4" />
						</span>

						{/* Type Icon */}
						<span className="flex items-center gap-1 text-base">
							{type === "MOVIE" ? (
								<Film className="h-4 w-4" />
							) : (
								<Tv className="h-4 w-4" />
							)}
							{type === "TV" ? "TV" : "Movie"}
						</span>
					</div>

					{/* User Rating */}
					<div className="flex items-center gap-1 text-amber-500 font-medium text-base">
						<Star className="h-4 w-4 fill-current" />
						<span>{rating ? rating : "-"}</span>
					</div>
				</div>
			</CardContent>
			{/* <CardFooter className="p-0 mt-2 px-4 pb-4">
				<div className="flex w-full gap-2">
					<Button
						variant="outline"
						className="flex-1 h-8 text-xs gap-2 hover:bg-green-50 hover:text-green-600 hover:border-green-200"
					>
						<CircleCheckBig className="h-3 w-3" /> Complete
					</Button>

					<div className="flex gap-1">
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8"
							onClick={() => onEdit?.(item.id)}
						>
							<Pencil className="h-3 w-3" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8 hover:text-destructive"
							onClick={() => onDelete?.(item.id)}
						>
							<Trash2 className="h-3 w-3" />
						</Button>
					</div>
				</div>
			</CardFooter> */}
		</Card>
	);
}
