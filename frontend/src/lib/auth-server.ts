// lib/auth-server.ts
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import api from "@/api/axios"; // Your existing instance
import type { Session, User } from "better-auth";

type AuthResponse = {
  session: Session;
  user: User;
} | null;

export const getAuthSession = createServerFn({ method: "GET" })
  .handler(async (): Promise<AuthResponse> => {
    const request = getRequest();
    const cookieHeader = request.headers.get("cookie");

    try {
      const res = await api.get("/auth/get-session", {
        baseURL: "http://localhost:8080/api", 
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
  });