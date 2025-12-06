import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner"; 

import type { WatchlistItem } from "@/types/watchlistItem";
import { BlurFade } from "../ui/blur-fade";
import { MediaGridCard } from "./mediaGridCard";
import { EditWatchlistDialog } from "./editWatchlistDialog";
import { updateWatchlistItem, deleteWatchlistItem } from "@/api/axios";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface WatchlistGridProps {
  items: WatchlistItem[];
}

export function WatchlistGrid({ items }: WatchlistGridProps) {
  const queryClient = useQueryClient();

  const [selectedItem, setSelectedItem] = useState<WatchlistItem | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // 1. DELETE MUTATION
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteWatchlistItem(id),
    onSuccess: () => {
      toast.success("Item removed from watchlist");
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
      setItemToDelete(null);
    },
    onError: () => toast.error("Failed to delete item"),
  });

  // 2. COMPLETE MUTATION
  const completeMutation = useMutation({
    mutationFn: (id: string) => updateWatchlistItem(id, "COMPLETED"),
    onSuccess: () => {
      toast.success("Marked as Completed");
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
    },
    onError: () => toast.error("Failed to update status"),
  });

  const handleEditClick = (id: string) => {
    const itemToEdit = items.find((i) => i.wishlistId === id); 
    if (itemToEdit) {
      setSelectedItem(itemToEdit);
      setIsEditOpen(true);
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {items.map((item, index) => (
           <BlurFade key={item.wishlistId} delay={0.05 * index} inView> 
            <MediaGridCard
              item={item}
              onEdit={handleEditClick}
              onDelete={(id) => setItemToDelete(id.toString())}
              onComplete={(id) => completeMutation.mutate(id.toString())}
            />
           </BlurFade> 
        ))}
      </div>

      {/* Edit Dialog */}
      <EditWatchlistDialog
        item={selectedItem}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently remove this show from your watchlist.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => {
                if (itemToDelete) deleteMutation.mutate(itemToDelete);
              }}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}