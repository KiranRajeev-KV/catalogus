// Search Bar
// Type Filter - ALL,MOVIE,TV,ANIME,MDL -> Button Group
// Status Filter - PLAN_TO_WATCH,WATCHING,COMPLETED,ON_HOLD,DROPPED -> Dropdown
// Sort By - DATE_ADDED,DATE_RELEASED,TITLE,RATING,PRIORITY -> Dropdown

import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	ToggleGroup,
	ToggleGroupItem,
} from "../animate-ui/components/radix/toggle-group";
import { Plus, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "../ui/button";

export function WishlistFilters() {
	const [isSearchOpen, setSearchOpen] = useState(false);

	// a manual way to focus the input when it appears.
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (isSearchOpen) {
			inputRef.current?.focus();
		}
	}, [isSearchOpen]);

	return (
		<div className="flex flex-row justify-between mb-3 py-2">
			<div className="flex flex-row space-x-2 items-center">
				{/* Add to watchlist button */}
				<Button
					variant="outline"
					className="rounded-lg shadow-xs text-base w-24 hover:bg-accent hover:scale-105 active:scale-[0.99] transition-all ease-in-out duration-150"
				>
					<Plus className="min-h-7 text-foreground" />
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
							/>
						)}
					</AnimatePresence>
				</div>
			</div>

			<div className="flex flex-row space-x-2 justify-center items-center">
				{/* Type Filter */}
				<ToggleGroup
					type="single"
					defaultValue="ALL"
					className="border gap-0 max-h-9 shadow-xs border-input"
				>
					<ToggleGroupItem value="ALL" className="px-3 text-base">
						All
					</ToggleGroupItem>
					<ToggleGroupItem value="MOVIE" className="px-3 border-l text-base">
						Movie
					</ToggleGroupItem>
					<ToggleGroupItem value="TV" className="px-3 border-l text-base">
						TV
					</ToggleGroupItem>
					<ToggleGroupItem value="ANIME" className="px-3 border-l text-base">
						Anime
					</ToggleGroupItem>
					<ToggleGroupItem value="DRAMA" className="px-3 border-l text-base">
						Drama
					</ToggleGroupItem>
				</ToggleGroup>

				{/* Status Dropdown */}
				<Select>
					<SelectTrigger className="w-[180px] text-base rounded-lg text-foreground">
						<SelectValue placeholder="Status" />
					</SelectTrigger>
					<SelectContent className="text-base">
						<SelectGroup className="">
							<SelectLabel>Status</SelectLabel>
							<SelectItem value="ALL" className="text-base">
								All
							</SelectItem>
							<SelectItem value="PLAN_TO_WATCH" className="text-base">
								Plan to Watch
							</SelectItem>
							<SelectItem value="WATCHING" className="text-base">
								Watching
							</SelectItem>
							<SelectItem value="COMPLETED" className="text-base">
								Completed
							</SelectItem>
							<SelectItem value="ON_HOLD" className="text-base">
								On Hold
							</SelectItem>
							<SelectItem value="DROPPED" className="text-base">
								Dropped
							</SelectItem>
						</SelectGroup>
					</SelectContent>
				</Select>

				{/* Sort By Dropdown */}
				<Select>
					<SelectTrigger className="w-[180px] text-base rounded-lg text-foreground">
						<SelectValue placeholder="Sort By" className="text-foreground" />
					</SelectTrigger>
					<SelectContent className="text-base">
						<SelectGroup>
							<SelectLabel>Sort By</SelectLabel>
							<SelectItem value="DATE_ADDED" className="text-base">
								Date Added
							</SelectItem>
							<SelectItem value="DATE_RELEASED" className="text-base">
								Date Released
							</SelectItem>
							<SelectItem value="TITLE" className="text-base">
								Title
							</SelectItem>
							<SelectItem value="RATING" className="text-base">
								Rating
							</SelectItem>
							<SelectItem value="PRIORITY" className="text-base">
								Priority
							</SelectItem>
						</SelectGroup>
					</SelectContent>
				</Select>
			</div>
		</div>
	);
}
