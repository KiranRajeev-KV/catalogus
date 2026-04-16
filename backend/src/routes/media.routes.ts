import { Router } from "express";
import { searchMedia } from "../controllers/media.controllers.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router: Router = Router();
router.use(requireAuth);

// GET /search
router.get("/search", searchMedia);

export default router;
