// frontend/src/components/watchlist-components/searchDialog.tsx

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Search, X, Film, Tv, Clapperboard } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { addItemToWatchlist, searchMedia } from "@/api/axios";
import { Button } from "@/components/ui/button";
import { useDebouncedCallback } from '@tanstack/react-pacer'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { MediaType, TMDBSearchResult } from "@/types/mediaItem";

interface SearchResponse {
    results: TMDBSearchResult[];
}

export function WatchlistSearchModal({
    children,
}: {
    children: React.ReactNode;
}) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [type, setType] = useState<MediaType>("MOVIE");
    const [results, setResults] = useState<TMDBSearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [addingId, setAddingId] = useState<string | null>(null);

    const queryClient = useQueryClient();
    const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w300";

    const debouncedHandleSearch = useDebouncedCallback(
    () => {
        handleSearch();
    },
    { wait: 500 }
    );

    const handleSearch = async () => {
        if (!query.trim()) return;
        setIsLoading(true);
        setHasSearched(true);
        setResults([]);
        try {
            const data: SearchResponse = await searchMedia(type, query);
            setResults(data.results || []);
        } catch (error) {
            console.error("Search failed", error);
            toast.error("Failed to search media");
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleSearch();
    };

    const mutation = useMutation({
        mutationFn: (item: TMDBSearchResult) => {
            return addItemToWatchlist({
                apiId: item.apiId,
                type: type,
                status: "PLAN_TO_WATCH",
            });
        },
        onSuccess: () => {
            toast.success("Added to watchlist");
            queryClient.invalidateQueries({ queryKey: ["watchlist"] });
            setOpen(false);
            setQuery("");
            setResults([]);
            setHasSearched(false);
        },
        onError: (error: any) => {
            if (error.response?.status === 409) {
                toast.info("This is already in your watchlist");
            } else {
                toast.error("Failed to add to watchlist");
            }
        },
        onSettled: () => setAddingId(null),
    });

    const addToWatchlist = (item: TMDBSearchResult) => {
        setAddingId(item.apiId);
        mutation.mutate(item);
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(val) => {
                setOpen(val);
                if (!val) {
                    setTimeout(() => {
                        setQuery("");
                        setResults([]);
                        setHasSearched(false);
                    }, 200);
                }
            }}
        >
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[750px] max-h-[85vh] flex flex-col gap-0 p-0 overflow-hidden border-border/60 bg-background/95 backdrop-blur-xl shadow-2xl">
                
                {/* --- HEADER SECTION --- */}
                <div className="p-6 pb-4 border-b border-border/40 space-y-4">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold tracking-tight">Add to Watchlist</DialogTitle>
                    </DialogHeader>

                    {/* Search Bar Controls */}
                    <div className="flex gap-3">
                        {/* Type Selector */}
                        <Select value={type} onValueChange={(val: MediaType) => {
                            setType(val);
                            debouncedHandleSearch();
                        }}>
                            <SelectTrigger size="default" className="w-[140px] !h-9 bg-muted/50 border-transparent focus:ring-primary/20 hover:bg-muted/80 transition-colors rounded-xl">
                                <div className="flex items-center gap-2 ">
                                    {type === "MOVIE" && <Film className="w-4 h-4 text-primary" />}
                                    {type === "TV" && <Tv className="w-4 h-4 text-primary" />}
                                    {type === "ANIME" && <Clapperboard className="w-4 h-4 text-primary" />}
                                    <SelectValue />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-border/50">
                                <SelectItem value="MOVIE">Movie</SelectItem>
                                <SelectItem value="TV">TV Show</SelectItem>
                                <SelectItem value="ANIME">Anime</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Search Input */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder={`Search for a ${type === "TV" ? "TV Show" : type.toLowerCase()}...`}
                                value={query}
                                onChange={(e) => {
                                    setQuery(e.target.value)
                                    debouncedHandleSearch()
                                }}
                                onKeyDown={handleKeyDown}
                                className="h-9 pl-10 pr-10 bg-muted/50 border-transparent  rounded-xl transition-all"
                                autoFocus
                            />
                            {query && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setHasSearched(false);
                                        setResults([]);
                                        setQuery("");
                                    }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-background text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Search Button */}
                        <Button 
                            onClick={handleSearch} 
                            disabled={isLoading} 
                            className="h-9 px-6 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                        >
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                "Search"
                            )}
                        </Button>
                    </div>
                </div>

                {/* --- RESULTS AREA --- */}
                <ScrollArea className="flex-1 h-[500px] p-6 bg-muted/10 overflow-y-auto">
                    {results.length > 0 ? (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-x-4 gap-y-8 pb-4">
                            {results.map((item) => (
                                <div
                                    key={`${item.apiSource}-${item.apiId}`}
                                    className="group flex flex-col gap-3"
                                >
                                    {/* Poster Container */}
                                    <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-muted shadow-sm ring-1 ring-border/50 group-hover:shadow-xl group-hover:ring-primary/30 transition-all duration-300">
                                        {item.poster_path ? (
                                            <img
                                                src={`${IMAGE_BASE_URL}${item.poster_path}`}
                                                alt={item.title}
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 text-center"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full flex-col items-center justify-center bg-secondary/50 text-muted-foreground gap-2 p-2 text-center">
                                                <Film className="w-8 h-8 opacity-20" />
                                                <span className="text-xs">No Image</span>
                                            </div>
                                        )}

                                        {/* Hover Overlay */}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                                            <Button
                                                size="icon"
                                                className="h-12 w-12 rounded-full shadow-2xl scale-90 group-hover:scale-100 transition-transform duration-300 bg-primary text-primary-foreground hover:bg-primary/90"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (addingId !== item.apiId) addToWatchlist(item);
                                                }}
                                            >
                                                {addingId === item.apiId ? (
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                ) : (
                                                    <Plus className="w-6 h-6" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Text Info */}
                                    <div className="space-y-1 text-center px-1">
                                        <h4
                                            className="font-semibold text-sm leading-tight line-clamp-1 group-hover:text-primary transition-colors"
                                            title={item.title}
                                        >
                                            {item.title}
                                        </h4>
                                        <p className="text-xs font-medium text-muted-foreground">
                                            {item.release_date
                                                ? item.release_date.split("-")[0]
                                                : "TBA"}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-4 opacity-60">
                            {isLoading ? (
                                <div className="flex flex-col items-center gap-4">
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                                    </div>
                                    <p className="text-sm font-medium">Searching the archives...</p>
                                </div>
                            ) : hasSearched ? (
                                <>
                                    <div className="p-4 rounded-full bg-muted/50">
                                        <Search className="h-8 w-8" />
                                    </div>
                                    <p>No results found for "{query}"</p>
                                </>
                            ) : (
                                <>
                                    <div className="p-6 rounded-full bg-primary/5 text-primary">
                                        <Clapperboard className="h-12 w-12" />
                                    </div>
                                    <div className="text-center space-y-1">
                                        <p className="text-lg font-medium text-foreground">Start your collection</p>
                                        <p className="text-sm">Search for movies, shows, or anime to add.</p>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}