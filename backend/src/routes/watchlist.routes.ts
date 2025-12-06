import { Router } from "express";
import { getWatchlist, addToWatchlist, updateWatchlistItem } from "../controllers/watchlist.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router: Router = Router();

router.use(requireAuth);

// GET /watchlist
router.get("/", getWatchlist);
router.post("/", addToWatchlist);
router.patch("/:id", updateWatchlistItem);

export default router;
