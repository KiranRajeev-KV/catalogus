import { useState } from "react";
import { Search, Loader2, Plus, X } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MediaType, TMDBSearchResult } from "@/types/mediaItem";
import { searchMedia } from "@/api/axios";

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

	// TMDB Image Base URL
	const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w300";

    const handleSearch = async () => {
        if (!query.trim()) return;

        setIsLoading(true);
        setHasSearched(true);
        setResults([]);

        const data: SearchResponse = await searchMedia(type, query);
        setResults(data.results || []);

        setIsLoading(false);
    };

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			handleSearch();
		}
	};

	const addToWatchlist = (item: TMDBSearchResult) => {
        setQuery("");
        setResults([]);
		console.log("Adding to watchlist:", item);
		// Add your API call logic here
		setOpen(false);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="sm:max-w-[700px] max-h-[85vh] flex flex-col rounded-lg">
				<DialogHeader>
					<DialogTitle>Add to Watchlist</DialogTitle>
				</DialogHeader>

				{/* Search Controls */}
				<div className="flex gap-2 mt-2">
					<Select value={type} onValueChange={(val: MediaType) => setType(val)}>
						<SelectTrigger className="w-[130px] text-base shadow-xs rounded-lg text-foreground">
							<SelectValue placeholder="Type" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="MOVIE" className="text-base">
								Movie
							</SelectItem>
							<SelectItem value="TV" className="text-base">
								TV Show
							</SelectItem>
							<SelectItem value="ANIME" className="text-base">
								Anime
							</SelectItem>
						</SelectContent>
					</Select>

                    <div className="relative flex-1">
                        <Input
                            placeholder={`Search ${type.toLowerCase()}...`}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="pr-10 shadow-xs rounded-lg px-2 py-1 border-input border h-9 focus:border focus-visible:ring-2 md:text-base text-foreground"
                            autoFocus
                        />
                        {query && (
                            <button
                                onClick={() => {
                                    setHasSearched(false);
                                    setResults([]);
                                    setQuery("");
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

					<Button onClick={handleSearch} disabled={isLoading}>
						{isLoading ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<Search className="h-4 w-4" />
						)}
					</Button>
				</div>

				{/* Results Grid Area */}
				<ScrollArea className="flex-1 mt-4 h-[450px] pr-2 -mr-2 overflow-y-auto">
					{results.length > 0 ? (
						<div className="grid grid-cols-3 sm:grid-cols-4 gap-4 pb-4">
							{results.map((item) => (
								<div
									key={`${item.apiSource}-${item.apiId}`}
									className="group relative flex flex-col gap-2"
								>
									{/* Poster Container */}
									<div className="relative aspect-2/3 w-full overflow-hidden rounded-xl bg-muted shadow-sm group-hover:shadow-md transition-all cursor-pointer">
										{item.poster_path ? (
											<img
												src={`${IMAGE_BASE_URL}${item.poster_path}`}
												alt={item.title}
												className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
											/>
										) : (
											<div className="flex h-full w-full items-center justify-center bg-secondary text-muted-foreground text-xs p-2 text-center">
												No Image
											</div>
										)}

										{/* Hover Overlay with Add Button */}
										<div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
											<div
												className="bg-primary text-primary-foreground rounded-full p-2 shadow-lg transform scale-90 group-hover:scale-100 transition-transform"
												onClick={() => addToWatchlist(item)}
											>
												<Plus className="w-6 h-6" />
											</div>
										</div>
									</div>

									{/* Title & Year Below */}
									<div className="space-y-1 text-center">
										<h4
											className="font-medium text-base leading-tight line-clamp-1"
											title={item.title}
										>
											{item.title}
										</h4>
										<p className="text-sm text-muted-foreground">
											{item.release_date
												? item.release_date.split("-")[0]
												: "Unknown"}
										</p>
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="h-full flex flex-col items-center justify-center text-muted-foreground py-10 gap-2">
							{isLoading ? (
								<div className="flex flex-col items-center gap-2">
									<Loader2 className="h-8 w-8 animate-spin text-primary" />
									<p>Searching...</p>
								</div>
							) : hasSearched ? (
								<>
									<Search className="h-10 w-10 opacity-20" />
									<p>No results found for "{query}"</p>
								</>
							) : (
								<>
									<Search className="h-10 w-10 opacity-20" />
									<p>Search for a movie, show, or anime to add.</p>
								</>
							)}
						</div>
					)}
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
}
