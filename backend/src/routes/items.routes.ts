// src/routes/items.routes.ts
import { Router } from "express";
import {
	getItemDetails,
	searchItems,
	updateItem,
} from "../controllers/items.controller.js";

const router: Router = Router();

// /api/items
router.get("/search", searchItems); // search items
router.get("/:id", getItemDetails); // Get item details
router.patch("/:id", updateItem); // update item metadata

export default router;
