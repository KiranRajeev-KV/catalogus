import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

import { updateWatchlistItem } from "@/api/axios";
import type { WatchlistItem } from "@/types/watchlistItem";
import type { StatusFilter } from "@/stores/filtersStore";

interface EditDialogProps {
	item: WatchlistItem | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function EditWatchlistDialog({
	item,
	open,
	onOpenChange,
}: EditDialogProps) {
	const queryClient = useQueryClient();

	// Form State
	const [status, setStatus] = useState<StatusFilter>("PLAN_TO_WATCH");
	const [rating, setRating] = useState<string>("");
	const [comments, setComments] = useState("");

	// Populate form when item opens
	useEffect(() => {
		if (item) {
			setStatus(item.status as StatusFilter);
			setRating(item.rating ? item.rating.toString() : "");
			setComments(item.comments || "");
		}
	}, [item]);

	const mutation = useMutation({
		mutationFn: async () => {
			if (!item) return;
			return updateWatchlistItem(
				item.wishlistId.toString(), // Ensure ID matches your axios type
				status,
				rating ? parseFloat(rating) : undefined,
				comments,
			);
		},
		onSuccess: () => {
			toast.success("Item updated");
			queryClient.invalidateQueries({ queryKey: ["watchlist"] });
			onOpenChange(false);
		},
		onError: () => {
			toast.error("Failed to update item");
		},
	});

	const handleSave = () => {
		mutation.mutate();
	};

	if (!item) return null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Edit: {item.mediaItem.title}</DialogTitle>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					{/* Status */}
					<div className="grid gap-2">
						<Label htmlFor="status">Status</Label>
						<Select
							value={status}
							onValueChange={(val) => setStatus(val as StatusFilter)}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="PLAN_TO_WATCH">Plan to Watch</SelectItem>
								<SelectItem value="WATCHING">Watching</SelectItem>
								<SelectItem value="COMPLETED">Completed</SelectItem>
								<SelectItem value="ON_HOLD">On Hold</SelectItem>
								<SelectItem value="DROPPED">Dropped</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Rating */}
					<div className="grid gap-2">
						<Label htmlFor="rating">Rating (0-10)</Label>
						<Input
							id="rating"
							type="number"
							min="0"
							max="10"
							step="0.1"
							value={rating}
							onChange={(e) => setRating(e.target.value)}
							placeholder="No rating"
						/>
					</div>

					{/* Comments */}
					<div className="grid gap-2">
						<Label htmlFor="comments">Comments</Label>
						<Textarea
							id="comments"
							value={comments}
							onChange={(e) => setComments(e.target.value)}
							placeholder="Add your thoughts..."
						/>
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button onClick={handleSave} disabled={mutation.isPending}>
						{mutation.isPending && (
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						)}
						Save Changes
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
