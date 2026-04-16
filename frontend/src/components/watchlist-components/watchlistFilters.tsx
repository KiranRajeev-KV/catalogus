// frontend/src/components/watchlist-components/watchlistFilters.tsx
// Search Bar
// Type Filter - ALL,MOVIE,TV,ANIME -> Button Group
// Status Filter - PLAN_TO_WATCH,WATCHING,COMPLETED,ON_HOLD,DROPPED -> Dropdown
// Sort By - DATE_ADDED,DATE_RELEASED,TITLE,RATING,PRIORITY -> Dropdown

import { LayoutGrid, List, Plus, Search } from "lucide-react";
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
import { WatchlistSearchModal } from "@/components/watchlist-components/searchDialog";
import useFilters, {
	type SortBy,
	type StatusFilter,
} from "@/stores/filtersStore";
import type { MediaType } from "@/types/mediaItem";
import {
	ToggleGroup,
	ToggleGroupItem,
} from "../animate-ui/components/radix/toggle-group";
import { Button } from "../ui/button";

export function WatchlistFilters() {
	const [isSearchOpen, setSearchOpen] = useState(false);
	const filters = useFilters();
	const [searchText, setSearchText] = useState(filters.q ?? "");

	// a manual way to focus the input when it appears.
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (isSearchOpen) {
			inputRef.current?.focus();
		}
	}, [isSearchOpen]);

	// Keyboard shortcut for search (Cmd+K / Ctrl+K)
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
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

	useEffect(() => {
		const handle = window.setTimeout(() => {
			const next = searchText.trim();
			filters.setSearchQuery(next ? next : undefined);
		}, 300);

		return () => window.clearTimeout(handle);
	}, [searchText, filters.setSearchQuery]);

	return (
		<div className="mb-4 space-y-3 py-2">
			<div className="flex flex-wrap items-center gap-2">
				{/* Add to watchlist button */}
				<WatchlistSearchModal>
					<Button className="bg-primary rounded-lg shadow-xs min-w-24 hover:scale-105 active:scale-[0.99] transition-all ease-in-out duration-150">
						<Plus className="size-6 text-primary-foreground" />
					</Button>
				</WatchlistSearchModal>

				{/* Search Bar */}
				<div className="relative flex items-center">
					<Button
						onClick={() => {
							setSearchOpen((o) => !o);
						}}
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
								animate={{ width: 280, opacity: 1 }}
								exit={{ width: 0, opacity: 0 }}
								transition={{ type: "spring", stiffness: 300, damping: 30 }}
								className="bg-input ml-2 shadow-xs rounded-lg px-2 py-1 border-input border h-9 focus:outline-none text-base text-foreground max-w-[70vw] sm:max-w-none"
								autoFocus={true}
								placeholder="Search..."
								value={searchText}
								onChange={(e) => setSearchText(e.target.value)}
							/>
						)}
					</AnimatePresence>
				</div>
			</div>
			<div className="flex flex-wrap items-center gap-2 justify-between">
				<div className="flex flex-wrap items-center gap-2">
				{/* Status Dropdown */}
				<Select
					value={filters.status ?? "ALL"}
					onValueChange={(status) => {
						filters.setStatusFilter(
							status === "ALL" ? undefined : (status as StatusFilter),
						);
					}}
				>
					<SelectTrigger className="w-full min-w-[170px] sm:w-[180px] text-base shadow-xs rounded-lg text-foreground">
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
				<Select
					value={filters.sort}
					onValueChange={(sort) => {
						filters.setSortBy(sort as SortBy);
					}}
				>
					<SelectTrigger className="w-full min-w-[170px] sm:w-[180px] text-base shadow-xs rounded-lg text-foreground">
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
									{
										{
											latest: "Latest",
											oldest: "Oldest",
											score_high: "Highest Score",
											score_low: "Lowest Score",
											title_az: "Title (A-Z)",
											title_za: "Title (Z-A)",
										}[option]
									}
								</SelectItem>
							))}
						</SelectGroup>
					</SelectContent>
				</Select>
				</div>
				<div className="flex flex-wrap items-center gap-2">
					{/* Type Filter */}
				<ToggleGroup
					type="single"
					value={filters.type ?? ""}
					className="border gap-0 max-h-9 shadow-xs border-input min-w-0"
				>
					{[
						{ label: "Movie", value: "MOVIE" },
						{ label: "TV", value: "TV" },
						{ label: "Anime", value: "ANIME" },
					].map((item) => (
						<ToggleGroupItem
							key={item.value}
							value={item.value}
							className="px-3 text-base border-l first:border-l-0 min-w-[4.5rem]"
							onClick={() => {
								filters.setTypeFilter(
									filters.type === item.value
										? undefined
										: (item.value as MediaType),
								);
							}}
						>
							{item.label}
						</ToggleGroupItem>
					))}
				</ToggleGroup>
				<ToggleGroup
					type="single"
					value={filters.viewMode}
					onValueChange={(value) => {
						if (value === "grid" || value === "table") {
							filters.setViewMode(value);
						}
					}}
					className="border gap-0 max-h-9 shadow-xs border-input"
					aria-label="Select watchlist view mode"
				>
					<ToggleGroupItem
						value="grid"
						className="px-3 text-base"
						aria-label="Grid view"
					>
						<LayoutGrid className="h-4 w-4 mr-1" />
						Grid
					</ToggleGroupItem>
					<ToggleGroupItem
						value="table"
						className="px-3 text-base border-l"
						aria-label="Table view"
					>
						<List className="h-4 w-4 mr-1" />
						Table
					</ToggleGroupItem>
				</ToggleGroup>
				</div>
			</div>
		</div>
	);
}
