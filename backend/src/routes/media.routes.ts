import { Router } from "express";
import { searchMedia } from "../controllers/media.controllers.js";

// TODO: add authentication middleware

const router: Router = Router();

// GET /search
router.get("/search", searchMedia);

export default router;
