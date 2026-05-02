import { createAuthClient } from "better-auth/react";

const apiBaseUrl =
	import.meta.env.VITE_API_BASE_URL?.trim() || "http://localhost:8080/api";
const authBaseUrl = apiBaseUrl.endsWith("/api")
	? apiBaseUrl.slice(0, -4)
	: apiBaseUrl;

export const authClient = createAuthClient({
	/** The base URL of the server (optional if you're using the same domain) */
	baseURL: authBaseUrl,
});
