// Search Bar
// Type Filter - ALL,MOVIE,TV,ANIME,MDL -> Button Group
// Status Filter - PLAN_TO_WATCH,WATCHING,COMPLETED,ON_HOLD,DROPPED -> Dropdown
// Sort By - DATE_ADDED,DATE_RELEASED,TITLE,RATING,PRIORITY -> Dropdown

import { Plus, Search } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import useFilters from "@/stores/filtersStore";
import type { MediaType } from "@/types/mediaItem";
import {
	ToggleGroup,
	ToggleGroupItem,
} from "../animate-ui/components/radix/toggle-group";
import { Button } from "../ui/button";

export function WatchlistFilters() {
	const [isSearchOpen, setSearchOpen] = useState(false);

	// a manual way to focus the input when it appears.
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (isSearchOpen) {
			inputRef.current?.focus();
		}
	}, [isSearchOpen]);

	// Keyboard shortcut for search (Cmd+K / Ctrl+K)
	useEffect(() => {
		const handleKeyDown = (e) => {
			const isMac = navigator.platform.toUpperCase().includes("MAC");
			const modKey = isMac ? e.metaKey : e.ctrlKey;

			if (modKey && e.key.toLowerCase() === "k") {
				e.preventDefault();
				setSearchOpen((o) => !o); // toggle search
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, []);

	// filters store
	const filters = useFilters();

	return (
		<div className="flex flex-row justify-between mb-3 py-2">
			<div className="flex flex-row space-x-2 items-center">
				{/* Add to watchlist button */}
				<Button className="bg-primary rounded-lg shadow-xs w-24 hover:scale-105 active:scale-[0.99] transition-all ease-in-out duration-150">
					<Plus className="size-6 text-primary-foreground" />
				</Button>

				{/* Search Bar */}
				<div className="relative flex items-center">
					<Button
						onClick={() => setSearchOpen((o) => !o)}
						variant={"outline"}
						className="p-2 focus:outline-none border-input rounded-lg shadow-xs text-base hover:bg-accent hover:scale-105 active:scale-[0.99] transition-all ease-in-out duration-150"
					>
						<Search className="w-6 h-6 text-foreground" />
						Search
					</Button>

					<AnimatePresence>
						{isSearchOpen && (
							<motion.input
								ref={inputRef}
								initial={{ width: 0, opacity: 0 }}
								animate={{ width: 300, opacity: 1 }}
								exit={{ width: 0, opacity: 0 }}
								transition={{ type: "spring", stiffness: 300, damping: 30 }}
								className="bg-input ml-2 shadow-xs rounded-lg px-2 py-1 border-input border h-9 focus:outline-none text-base text-foreground"
								autoFocus={true}
								placeholder="Search..."
								value={filters.searchQuery}
								onChange={(e) => filters.setSearchQuery(e.target.value)}
							/>
						)}
					</AnimatePresence>
				</div>
			</div>

			<div className="flex flex-row space-x-2 justify-center items-center">
				{/* Type Filter */}
				<ToggleGroup
					type="single"
					className="border gap-0 max-h-9 shadow-xs border-input"
				>
					{["Movie", "TV", "Anime", "Drama"].map((type) => (
						<ToggleGroupItem
							key={type}
							value={type}
							className={`w-18 px-3 text-base ${type !== "ALL" ? "border-l" : ""}`}
							onClick={() =>
								filters.setTypeFilter(
									filters.typeFilter === type.toUpperCase()
										? ""
										: (type.toUpperCase() as MediaType),
								)
							}
						>
							{type}
						</ToggleGroupItem>
					))}
				</ToggleGroup>

				{/* Status Dropdown */}
				<Select
					onValueChange={(status) =>
						filters.setStatusFilter(status === "ALL" ? "" : status)
					}
				>
					<SelectTrigger className="w-[180px] text-base shadow-xs rounded-lg text-foreground">
						<SelectValue placeholder="Status" />
					</SelectTrigger>
					<SelectContent className="text-base">
						<SelectGroup className="">
							<SelectLabel>Status</SelectLabel>
							{[
								"ALL",
								"PLAN_TO_WATCH",
								"WATCHING",
								"COMPLETED",
								"ON_HOLD",
								"DROPPED",
							].map((status) => (
								<SelectItem key={status} value={status} className="text-base">
									{status
										.split("_")
										.map((word) => word.charAt(0) + word.slice(1).toLowerCase())
										.join(" ")}
								</SelectItem>
							))}
						</SelectGroup>
					</SelectContent>
				</Select>

				{/* Sort By Dropdown */}
				<Select onValueChange={(sortBy) => filters.setSortBy(sortBy)}>
					<SelectTrigger className="w-[180px] text-base shadow-xs rounded-lg text-foreground">
						<SelectValue placeholder="Sort By" className="text-foreground" />
					</SelectTrigger>
					<SelectContent className="text-base">
						<SelectGroup>
							<SelectLabel>Sort By</SelectLabel>
							{[
								"latest",
								"oldest",
								"score_high",
								"score_low",
								"title_az",
								"title_za",
							].map((option) => (
								<SelectItem key={option} value={option} className="text-base">
									{option === "latest"
										? "Latest"
										: option === "oldest"
											? "Oldest"
											: option === "score_high"
												? "Highest Score"
												: option === "score_low"
													? "Lowest Score"
													: option === "title_az"
														? "Title (A-Z)"
														: "Title (Z-A)"}
								</SelectItem>
							))}
						</SelectGroup>
					</SelectContent>
				</Select>
			</div>
		</div>
	);
}
