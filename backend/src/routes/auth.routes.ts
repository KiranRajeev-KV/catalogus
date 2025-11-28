// src/routes/auth.routes.ts

import { toNodeHandler } from "better-auth/node";
import { Router } from "express";
import { auth } from "../lib/auth.js";

const router: Router = Router();

// This "all" route catches every auth request
router.all("/{*any}", toNodeHandler(auth));

export default router;
