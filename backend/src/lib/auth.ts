//src/lib/auth.ts
import "dotenv/config";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "../db/client.js";
import { tanstackStartCookies } from "better-auth/tanstack-start";

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
		}

	},
	secret: process.env.BETTER_AUTH_SECRET,
	baseURL: process.env.BETTER_AUTH_URL,
	trustedOrigins: [
		"http://localhost:3000",
		"http://localhost:8080",
	],
	plugins:[tanstackStartCookies()],
});
