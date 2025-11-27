// src/routes/wishlist.routes.ts
import { Router } from "express";
import {
	addToWishlist,
	getWishlist,
	removeFromWishlist,
	updateWishlistEntry,
} from "../controllers/wishlist.controller.js";

const router: Router = Router();

// /api/wishlist
router.get("/", getWishlist); // Get wishlist items
router.post("/", addToWishlist); // Upsert item + Add to list
router.patch("/:id", updateWishlistEntry); // Update score/status
router.delete("/:id", removeFromWishlist); // Remove from list

export default router;
