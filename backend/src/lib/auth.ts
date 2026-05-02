//src/lib/auth.ts
import "dotenv/config";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { prisma } from "../db/client.js";
import { getAllowedOrigins } from "./origins.js";

export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),
	emailAndPassword: {
		enabled: true,
		autoSignIn: true,
	},
	session: {
		cookieCache: {
			enabled: true,
		},
	},
	secret: process.env.BETTER_AUTH_SECRET,
	baseURL: process.env.BETTER_AUTH_URL,
	// Cross-site auth cookies require HTTPS plus aligned BETTER_AUTH_URL,
	// FRONTEND_URL, trustedOrigins, and CORS credentials settings.
	trustedOrigins: getAllowedOrigins(),
	plugins: [tanstackStartCookies()],
});
