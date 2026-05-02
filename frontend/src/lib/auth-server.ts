// lib/auth-server.ts
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import type { Session, User } from "better-auth";
import api from "@/api/axios"; // Your existing instance

type AuthResponse = {
	session: Session;
	user: User;
} | null;

const apiBaseUrl =
	import.meta.env.VITE_API_BASE_URL?.trim() || "http://localhost:8080/api";

export const getAuthSession = createServerFn({ method: "GET" }).handler(
	async (): Promise<AuthResponse> => {
		const request = getRequest();
		const cookieHeader = request.headers.get("cookie");

		try {
			const res = await api.get("/auth/get-session", {
				baseURL: apiBaseUrl,
				headers: {
					Cookie: cookieHeader || "",
				},
			});

			if (!res.data?.session) {
				return null;
			}

			return res.data;
		} catch (error) {
			console.error("SSR Auth Check Failed:", error);
			return null;
		}
	},
);
