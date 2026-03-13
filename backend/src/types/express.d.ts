import type { User, Session } from "better-auth/types";

declare global {
	namespace Express {
		interface Request {
			user?: User;
			session?: Session;
		}
	}
}
