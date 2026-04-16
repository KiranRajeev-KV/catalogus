import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	Clapperboard,
	Film,
	Loader2,
	Plus,
	Search,
	Sparkles,
	Star,
	Tv,
	X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
	type ApiErrorPayload,
	addItemToWatchlist,
	deleteWatchlistItem,
	searchMedia,
} from "@/api/axios";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import useSearchUiStore from "@/stores/searchUiStore";
import type { MediaSearchResult, MediaType } from "@/types/mediaItem";
import type { WatchlistStatus } from "@/types/watchlistItem";

interface SearchErrorState {
	title: string;
	message: string;
	error?: ApiErrorPayload;
}

const QUICK_STATUS_OPTIONS: Array<{ label: string; value: WatchlistStatus }> = [
	{ label: "Plan", value: "PLAN_TO_WATCH" },
	{ label: "Watching", value: "WATCHING" },
	{ label: "Completed", value: "COMPLETED" },
	{ label: "On Hold", value: "ON_HOLD" },
	{ label: "Dropped", value: "DROPPED" },
];

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w300";

function getPosterUrl(path: string | null) {
	if (!path) return null;
	if (path.startsWith("http://") || path.startsWith("https://")) {
		return path;
	}
	return `${IMAGE_BASE_URL}${path}`;
}

function keyFor(item: MediaSearchResult) {
	return `${item.apiSource}:${item.apiId}:${item.type}`;
}

function getYear(date: string | null) {
	if (!date) return "TBA";
	return date.split("-")[0] || "TBA";
}

function formatScore(value?: number | null) {
	if (typeof value !== "number") return "-";
	return value.toFixed(1);
}

function formatRuntimeEpisodes(item: MediaSearchResult) {
	const runtime = item.episode_runtime;
	const episodes = item.total_episodes;
	if (runtime && episodes) return `${runtime}m/ep - ${episodes} eps`;
	if (runtime) return `${runtime}m/ep`;
	if (episodes) return `${episodes} eps`;
	return "-";
}

function getErrorCopy(error: ApiErrorPayload | null | undefined): SearchErrorState {
	if (!error) {
		return {
			title: "Search failed",
			message: "Unexpected error while searching. Please try again.",
		};
	}

	switch (error.code) {
		case "PROVIDER_RATE_LIMITED":
			return {
				title: "Provider is rate limited",
				message:
					error.message ||
					"Too many requests were sent to the provider. Please retry shortly.",
				error,
			};
		case "PROVIDER_UNAVAILABLE":
			return {
				title: `${error.provider ?? "Provider"} is unavailable`,
				message:
					error.message ||
					"The upstream provider is unavailable right now. Retry in a moment.",
				error,
			};
		case "VALIDATION_FAILED":
			return {
				title: "Invalid search request",
				message: "Some search inputs are invalid. Please retry your query.",
				error,
			};
		case "UNAUTHORIZED":
			return {
				title: "Session expired",
				message: "Please sign in again to continue searching.",
				error,
			};
		default:
			return {
				title: "Search unavailable",
				message:
					error.message || "We could not load search results right now.",
				error,
			};
	}
}

export function WatchlistSearchModal({
	children,
}: {
	children: React.ReactNode;
}) {
	const queryClient = useQueryClient();
	const inputRef = useRef<HTMLInputElement>(null);
	const abortRef = useRef<AbortController | null>(null);

	const lastTypePref = useSearchUiStore((state) => state.lastType);
	const includeAdultPref = useSearchUiStore((state) => state.includeAdult);
	const lastStatusPref = useSearchUiStore((state) => state.lastStatus);
	const recentSearches = useSearchUiStore((state) => state.recentSearches);
	const recentAdded = useSearchUiStore((state) => state.recentAdded);
	const setLastTypePref = useSearchUiStore((state) => state.setLastType);
	const setIncludeAdultPref = useSearchUiStore((state) => state.setIncludeAdult);
	const setLastStatusPref = useSearchUiStore((state) => state.setLastStatus);
	const pushRecentSearch = useSearchUiStore((state) => state.pushRecentSearch);
	const pushRecentAdded = useSearchUiStore((state) => state.pushRecentAdded);
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");
	const [type, setType] = useState<MediaType>(lastTypePref);
	const [includeAdult, setIncludeAdult] = useState(includeAdultPref);
	const [results, setResults] = useState<MediaSearchResult[]>([]);
	const [nextCursor, setNextCursor] = useState<string | null>(null);
	const [hasMore, setHasMore] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const [hasSearched, setHasSearched] = useState(false);
	const [activeIndex, setActiveIndex] = useState(-1);
	const [addingId, setAddingId] = useState<string | null>(null);
	const [removingId, setRemovingId] = useState<string | null>(null);
	const [addedLocal, setAddedLocal] = useState<Set<string>>(new Set());
	const [searchError, setSearchError] = useState<SearchErrorState | null>(null);
	const [fallbackMessage, setFallbackMessage] = useState<string | null>(null);
	const [addStatus, setAddStatus] = useState<WatchlistStatus>(lastStatusPref);

	const resultKeys = useMemo(() => results.map((item) => keyFor(item)), [results]);

	const resetSearchState = () => {
		setResults([]);
		setNextCursor(null);
		setHasMore(false);
		setHasSearched(false);
		setActiveIndex(-1);
		setSearchError(null);
		setFallbackMessage(null);
	};

	const runSearch = async ({
		cursor,
		append,
		typeOverride,
		includeAdultOverride,
	}: {
		cursor?: string | null;
		append?: boolean;
		typeOverride?: MediaType;
		includeAdultOverride?: boolean;
	}) => {
		const nextType = typeOverride ?? type;
		const nextIncludeAdult = includeAdultOverride ?? includeAdult;
		const trimmedQuery = query.trim();
		if (!trimmedQuery) {
			resetSearchState();
			return;
		}

		if (abortRef.current) {
			abortRef.current.abort();
		}
		const controller = new AbortController();
		abortRef.current = controller;

		if (append) {
			setIsLoadingMore(true);
		} else {
			setIsLoading(true);
			setHasSearched(true);
			setSearchError(null);
			setFallbackMessage(null);
			setActiveIndex(-1);
		}

		try {
			const response = await searchMedia(
				nextType,
				trimmedQuery,
				nextType === "ANIME" ? nextIncludeAdult : false,
				cursor ?? null,
				20,
				controller.signal,
			);

			const incoming = response.data?.results ?? [];
			setResults((prev) => {
				if (!append) return incoming;
				const next = [...prev];
				for (const item of incoming) {
					const k = keyFor(item);
					if (!next.some((x) => keyFor(x) === k)) {
						next.push(item);
					}
				}
				return next;
			});

			setNextCursor(response.meta?.pagination?.nextCursor ?? null);
			setHasMore(Boolean(response.meta?.pagination?.hasMore));
			setSearchError(response.error ? getErrorCopy(response.error) : null);

			if (response.meta?.provider?.fallbackUsed) {
				setFallbackMessage(
					"Live provider unavailable. Showing cached local matches.",
				);
				toast.warning("Showing cached local matches");
			} else {
				setFallbackMessage(null);
			}

			if (!append) {
				pushRecentSearch({
					query: trimmedQuery,
					type: nextType,
					includeAdult: nextType === "ANIME" ? nextIncludeAdult : false,
				});
			}
		} catch (error) {
			if (axios.isAxiosError(error) && error.code === "ERR_CANCELED") {
				return;
			}

			if (axios.isAxiosError(error)) {
				const payload = error.response?.data?.error as ApiErrorPayload | undefined;
				setSearchError(getErrorCopy(payload));
			} else {
				setSearchError(getErrorCopy(undefined));
			}
		} finally {
			setIsLoading(false);
			setIsLoadingMore(false);
		}
	};

	useEffect(() => {
		if (!open) return;
		const trimmed = query.trim();
		if (!trimmed) {
			resetSearchState();
			return;
		}

		const handle = window.setTimeout(() => {
			void runSearch({ append: false });
		}, 300);

		return () => window.clearTimeout(handle);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [query, type, includeAdult, open]);

	useEffect(() => {
		setLastTypePref(type);
	}, [type, setLastTypePref]);

	useEffect(() => {
		setIncludeAdultPref(includeAdult);
	}, [includeAdult, setIncludeAdultPref]);

	useEffect(() => {
		setLastStatusPref(addStatus);
	}, [addStatus, setLastStatusPref]);

	useEffect(() => {
		if (open) {
			window.setTimeout(() => {
				inputRef.current?.focus();
			}, 20);
		}
	}, [open]);

	const addMutation = useMutation({
		mutationFn: (item: MediaSearchResult) => {
			return addItemToWatchlist({
				apiId: item.apiId,
				type: item.type,
				status: addStatus || "PLAN_TO_WATCH",
			});
		},
		onSuccess: (data: { wishlistId?: string } | undefined, item) => {
			const itemKey = keyFor(item);
			setAddedLocal((prev) => new Set(prev).add(itemKey));
			setResults((prev) =>
				prev.map((row) =>
					keyFor(row) === itemKey
						? {
								...row,
								inWatchlist: true,
								wishlistId:
									typeof data?.wishlistId === "string" ? data.wishlistId : null,
							}
						: row,
				),
			);
			pushRecentAdded({
				apiId: item.apiId,
				title: item.title,
				type: item.type,
				apiSource:
					item.apiSource === "ANILIST" ? "ANILIST" : "TMDB",
			});
			toast.success("Added to watchlist");
			queryClient.invalidateQueries({ queryKey: ["watchlist"] });
			setAddingId(null);
			inputRef.current?.focus();
		},
		onError: (error: unknown) => {
			if (axios.isAxiosError(error)) {
				const payload = error.response?.data?.error as ApiErrorPayload | undefined;
				if (payload?.code === "WATCHLIST_DUPLICATE") {
					toast.info("Already in your watchlist");
				} else {
					toast.error(payload?.message || "Failed to add to watchlist");
				}
			} else {
				toast.error("Failed to add to watchlist");
			}
			setAddingId(null);
		},
	});

	const removeMutation = useMutation({
		mutationFn: async (payload: {
			wishlistId: string;
			rowKey: string;
			apiId: string;
		}) => {
			await deleteWatchlistItem(payload.wishlistId);
			return payload;
		},
		onSuccess: (payload) => {
			setResults((prev) =>
				prev.map((row) =>
					keyFor(row) === payload.rowKey
						? { ...row, inWatchlist: false, wishlistId: null }
						: row,
				),
			);
			setAddedLocal((prev) => {
				const next = new Set(prev);
				next.delete(payload.rowKey);
				return next;
			});
			queryClient.invalidateQueries({ queryKey: ["watchlist"] });
			toast.success("Removed from watchlist");
		},
		onError: () => {
			toast.error("Failed to remove from watchlist");
		},
		onSettled: () => {
			setRemovingId(null);
		},
	});

	const addToWatchlist = (item: MediaSearchResult) => {
		setAddingId(item.apiId);
		addMutation.mutate(item);
	};

	const removeFromWatchlist = (item: MediaSearchResult) => {
		if (!item.wishlistId) {
			toast.error("Cannot remove this item right now. Refresh and try again.");
			return;
		}
		setRemovingId(item.apiId);
		removeMutation.mutate({
			wishlistId: item.wishlistId,
			rowKey: keyFor(item),
			apiId: item.apiId,
		});
	};

	const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Escape") {
			e.preventDefault();
			setOpen(false);
			return;
		}

		if (["1", "2", "3", "4", "5"].includes(e.key)) {
			const index = Number(e.key) - 1;
			const status = QUICK_STATUS_OPTIONS[index]?.value;
			if (status) {
				setAddStatus(status);
			}
		}

		if (e.key === "ArrowDown") {
			e.preventDefault();
			if (!resultKeys.length) return;
			setActiveIndex((prev) => (prev + 1) % resultKeys.length);
			return;
		}

		if (e.key === "ArrowUp") {
			e.preventDefault();
			if (!resultKeys.length) return;
			setActiveIndex((prev) =>
				prev <= 0 ? resultKeys.length - 1 : prev - 1,
			);
			return;
		}

		if (e.key === "Enter") {
			e.preventDefault();
			void runSearch({ append: false });
		}
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(val) => {
				setOpen(val);
				if (!val) {
					abortRef.current?.abort();
					setQuery("");
					setAddedLocal(new Set());
					resetSearchState();
				}
			}}
		>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="sm:max-w-[860px] max-h-[86vh] flex flex-col gap-0 p-0 overflow-hidden border-border/60 bg-background/95 backdrop-blur-xl shadow-2xl">
				<div className="p-5 pb-4 border-b border-border/40 space-y-4">
					<DialogHeader>
						<DialogTitle className="text-xl font-semibold tracking-tight">
							Add to Watchlist
						</DialogTitle>
					</DialogHeader>

					<div className="flex gap-2">
						<Select
							value={type}
							onValueChange={(val: MediaType) => {
								setType(val);
							}}
						>
							<SelectTrigger className="w-[136px] h-9 rounded-xl bg-muted/40 border-border/50">
								<div className="flex items-center gap-2">
									{type === "MOVIE" && <Film className="h-4 w-4 text-primary" />}
									{type === "TV" && <Tv className="h-4 w-4 text-primary" />}
									{type === "ANIME" && (
										<Clapperboard className="h-4 w-4 text-primary" />
									)}
									<SelectValue />
								</div>
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="MOVIE">Movie</SelectItem>
								<SelectItem value="TV">TV Show</SelectItem>
								<SelectItem value="ANIME">Anime</SelectItem>
							</SelectContent>
						</Select>

						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								ref={inputRef}
								placeholder={`Search ${type === "TV" ? "TV shows" : type.toLowerCase()}...`}
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								onKeyDown={handleInputKeyDown}
								className="h-9 pl-10 pr-10 rounded-xl border-border/50 bg-muted/20"
							/>
							{query && (
								<button
									type="button"
									onClick={() => {
										setQuery("");
										resetSearchState();
									}}
									className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-accent text-muted-foreground"
								>
									<X className="h-3.5 w-3.5" />
								</button>
							)}
						</div>

						<Button
							onClick={() => void runSearch({ append: false })}
							disabled={isLoading}
							className="h-9 rounded-xl px-5"
						>
							{isLoading ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								"Search"
							)}
						</Button>
					</div>

					<div className="flex items-center gap-2 p-1">
						{type === "ANIME" ? (
							<Button
								type="button"
								variant={includeAdult ? "default" : "outline"}
								size="sm"
								onClick={() => setIncludeAdult((prev) => !prev)}
							>
								Adult: {includeAdult ? "On" : "Off"}
							</Button>
						) : (
							<div />
						)}

						<div className="ml-auto flex items-center gap-2">
							<span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
								Quick Status
							</span>
							<Select
								value={addStatus}
								onValueChange={(value: WatchlistStatus) => setAddStatus(value)}
							>
								<SelectTrigger className="h-8 w-[220px] text-sm shadow-xs rounded-lg text-foreground">
									<SelectValue placeholder="Quick Status" />
								</SelectTrigger>
								<SelectContent className="text-base">
									{QUICK_STATUS_OPTIONS.map((option) => (
										<SelectItem key={option.value} value={option.value}>
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					{recentSearches.length > 0 && !query.trim() && (
						<div className="flex flex-wrap gap-2">
							{recentSearches.map((entry) => (
								<Button
									key={`${entry.type}-${entry.query}-${entry.at}`}
									variant="outline"
									size="sm"
									onClick={() => {
										setType(entry.type);
										setIncludeAdult(entry.includeAdult);
										setQuery(entry.query);
									}}
								>
									{entry.query}
								</Button>
							))}
						</div>
					)}
				</div>

				<div className="flex-1 min-h-0 overflow-y-auto bg-muted/10 px-5 py-4">
					{fallbackMessage && (
						<div className="mb-3 rounded-xl border border-amber-400/40 bg-amber-50/70 px-4 py-2 text-sm text-amber-900 dark:border-amber-500/40 dark:bg-amber-950/40 dark:text-amber-200">
							{fallbackMessage}
						</div>
					)}

					{searchError && !results.length && (
						<div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 mb-4">
							<p className="text-sm font-semibold text-destructive">
								{searchError.title}
							</p>
							<p className="text-sm text-foreground/80 mt-1">{searchError.message}</p>
							<div className="flex flex-wrap gap-2 mt-3">
								<Button
									size="sm"
									onClick={() => void runSearch({ append: false })}
								>
									Retry
								</Button>
								{type === "ANIME" && includeAdult && (
									<Button
										size="sm"
										variant="outline"
										onClick={() => {
											setIncludeAdult(false);
											void runSearch({
												append: false,
												includeAdultOverride: false,
											});
										}}
									>
										Retry with Adult Off
									</Button>
								)}
							</div>
						</div>
					)}

					{results.length > 0 ? (
						<div className="space-y-2 pb-4">
							{results.map((item, index) => {
								const rowKey = keyFor(item);
								const inWatchlist =
									Boolean(item.inWatchlist) || addedLocal.has(rowKey);
								const isAddBusy = addingId === item.apiId;
								const isRemoveBusy = removingId === item.apiId;
								const isActive = index === activeIndex;

								return (
									<div
										key={rowKey}
										onMouseEnter={() => setActiveIndex(index)}
										className={`w-full rounded-xl border px-3 py-3 text-left transition ${
											isActive
												? "border-primary/50 bg-primary/5"
												: "border-border/50 bg-background/70 hover:border-primary/30"
										}`}
									>
										<div className="flex items-start gap-3">
											<div className="h-[84px] w-[56px] shrink-0 overflow-hidden rounded-md bg-muted ring-1 ring-border/50">
												{getPosterUrl(item.poster_path) ? (
													<img
														src={getPosterUrl(item.poster_path) || undefined}
														alt={item.title}
														className="h-full w-full object-cover"
														loading="lazy"
													/>
												) : (
													<div className="h-full w-full flex items-center justify-center text-muted-foreground">
														<Film className="h-5 w-5" />
													</div>
												)}
											</div>

											<div className="min-w-0 flex-1">
												<div className="flex items-center gap-2 flex-wrap">
													<p className="font-semibold leading-tight line-clamp-1">
														{item.title}
													</p>
													<span className="text-muted-foreground text-sm">
														{getYear(item.release_date)}
													</span>
													<Badge variant="outline">{item.type}</Badge>
													<Badge variant="secondary">{item.apiSource}</Badge>
												</div>

												<div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
													<span className="inline-flex items-center gap-1">
														<Star className="h-3.5 w-3.5 text-amber-500" />
														{formatScore(item.community_rating)}
													</span>
													<span>{formatRuntimeEpisodes(item)}</span>
													{typeof item.vote_count === "number" && item.vote_count > 0 && (
														<span>{item.vote_count} votes</span>
													)}
												</div>

										</div>

											<div className="shrink-0">
												<Button
													size="sm"
													disabled={isAddBusy || isRemoveBusy}
													variant={inWatchlist ? "outline" : "default"}
													onClick={(e) => {
														e.stopPropagation();
														if (inWatchlist) {
															removeFromWatchlist(item);
														} else {
															addToWatchlist(item);
														}
													}}
												>
													{isAddBusy || isRemoveBusy ? (
														<Loader2 className="h-4 w-4 animate-spin" />
													) : inWatchlist ? (
														"Remove"
													) : (
														<>
															<Plus className="h-4 w-4 mr-1" />
															Add
														</>
													)}
												</Button>
											</div>
										</div>
									</div>
								);
							})}

							{hasMore && (
								<div className="pt-2">
									<Button
										variant="outline"
										className="w-full"
										onClick={() => void runSearch({ append: true, cursor: nextCursor })}
										disabled={isLoadingMore || !nextCursor}
									>
										{isLoadingMore ? (
											<Loader2 className="h-4 w-4 animate-spin" />
										) : (
											"Load more"
										)}
									</Button>
								</div>
							)}
						</div>
					) : isLoading ? (
						<div className="h-full flex items-center justify-center text-muted-foreground gap-3">
							<Loader2 className="h-5 w-5 animate-spin" />
							<p className="text-sm">Searching...</p>
						</div>
					) : hasSearched ? (
						<div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-3">
							<Search className="h-8 w-8" />
							<p className="text-sm">No results found for "{query}"</p>
						</div>
					) : (
						<div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-4">
							<div className="p-5 rounded-full bg-primary/10 text-primary">
								<Sparkles className="h-8 w-8" />
							</div>
							<div className="text-center space-y-1">
								<p className="font-medium text-foreground">Search and add quickly</p>
								<p className="text-sm">Use arrows + Enter to add without leaving keyboard.</p>
							</div>
							{recentAdded.length > 0 && (
								<>
									<Separator className="w-2/3" />
									<div className="flex flex-wrap items-center justify-center gap-2 max-w-xl">
										{recentAdded.map((entry) => (
											<Badge
												key={`${entry.apiId}-${entry.apiSource}-${entry.at}`}
												variant="secondary"
											>
												{entry.title}
											</Badge>
										))}
									</div>
								</>
							)}
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
