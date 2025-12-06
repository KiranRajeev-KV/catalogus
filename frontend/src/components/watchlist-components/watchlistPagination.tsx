import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
}

export function WatchlistPagination({
	currentPage,
	totalPages,
	onPageChange,
}: PaginationProps) {
	// If only 1 page, don't show pagination
	if (totalPages <= 1) return null;

	// Helper to generate page numbers with ellipsis
	const getPageNumbers = () => {
		const pages = [];
		const maxVisiblePages = 5; // How many buttons to show at once

		if (totalPages <= maxVisiblePages) {
			// Show all pages if total is small
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i);
			}
		} else {
			// better logic for ellipsis
			if (currentPage <= 3) {
				// Near start: 1 2 3 ... 10
				pages.push(1, 2, 3, "...", totalPages);
			} else if (currentPage >= totalPages - 2) {
				// Near end: 1 ... 8 9 10
				pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
			} else {
				// Middle: 1 ... 4 5 6 ... 10
				pages.push(
					1,
					"...",
					currentPage - 1,
					currentPage,
					currentPage + 1,
					"...",
					totalPages,
				);
			}
		}
		return pages;
	};

	return (
		<div className="flex items-center justify-center space-x-2 py-8">
			{/* PREVIOUS BUTTON */}
			<Button
				variant="outline"
				size="icon"
				onClick={() => onPageChange(currentPage - 1)}
				disabled={currentPage === 1}
				className="h-8 w-8"
			>
				<ChevronLeft className="h-4 w-4" />
				<span className="sr-only">Previous</span>
			</Button>

			{/* PAGE NUMBERS */}
			{getPageNumbers().map((page, index) => {
				if (page === "...") {
					return (
						<div
							// biome-ignore lint/suspicious/noArrayIndexKey: key is acceptable here
							key={`ellipsis-${index}`}
							className="flex items-center justify-center w-8"
						>
							<MoreHorizontal className="h-4 w-4 text-muted-foreground" />
						</div>
					);
				}

				return (
					<Button
						key={page}
						variant={currentPage === page ? "default" : "outline"}
						size="icon"
						onClick={() => onPageChange(page as number)}
						className="h-8 w-8"
					>
						{page}
					</Button>
				);
			})}

			{/* NEXT BUTTON */}
			<Button
				variant="outline"
				size="icon"
				onClick={() => onPageChange(currentPage + 1)}
				disabled={currentPage === totalPages}
				className="h-8 w-8"
			>
				<ChevronRight className="h-4 w-4" />
				<span className="sr-only">Next</span>
			</Button>
		</div>
	);
}
