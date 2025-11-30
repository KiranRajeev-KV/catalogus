// src/routes/items.routes.ts
import { Router } from "express";
import {
	addItem,
	getItemDetails,
	searchItems,
	updateItem,
} from "../controllers/items.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router: Router = Router();

// /api/items
router.get("/search", searchItems); // search items
router.get("/:id", getItemDetails); // Get item details

router.post("/", requireAuth, addItem); // add new item
router.patch("/:id", requireAuth, updateItem); // update item metadata

export default router;
