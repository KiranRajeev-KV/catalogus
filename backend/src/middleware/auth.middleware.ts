// src/middleware/auth.middleware.ts
import { fromNodeHeaders } from "better-auth/node";
import type { NextFunction, Request, Response } from "express";
import { auth } from "../lib/auth.js";

export const requireAuth = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const session = await auth.api.getSession({
			headers: fromNodeHeaders(req.headers),
		});

		if (!session) {
			return res.status(401).json({ error: "Unauthorized" });
		}

		// Attach user to request so controllers can use it
		(req as any).user = session.user;
		(req as any).session = session.session;

		next();
	} catch (error) {
		console.error("Auth Error", error);
		res.status(500).json({ error: "Auth verification failed" });
	}
};
