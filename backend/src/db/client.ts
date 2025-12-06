// src/db/client.ts

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";
import "dotenv/config";

const adapter = new PrismaPg({
	connectionString: process.env.DATABASE_URL,
});
export const prisma = new PrismaClient({ adapter }).$extends({
	query: {
		wishlist: {
			async update({ args, query }) {
				// If status is being updated, set completedAt accordingly
				if (args.data.status) {
					if (args.data.status === "COMPLETED") {
						args.data.completedAt = new Date();
					} else {
						args.data.completedAt = null;
					}
				}
				return query(args);
			},
		},
	},
});
