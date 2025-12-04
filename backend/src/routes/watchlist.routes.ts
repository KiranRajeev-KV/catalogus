import { Router } from "express";
import { getWatchlist, addToWatchlist } from "../controllers/watchlist.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router: Router = Router();

router.use(requireAuth);

// GET /watchlist
router.get("/", getWatchlist);
router.post("/", addToWatchlist);

export default router;
