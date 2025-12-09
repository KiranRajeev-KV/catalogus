import { Redis } from "ioredis";

// Connect to Redis (defaults to localhost:6379)
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

export const cache = {
	// Get data
	get: async (key: string) => {
		const data = await redis.get(key);
		return data ? JSON.parse(data) : null;
	},

	// Set data with Expiration (TTL)
	set: async (key: string, value: any, ttlSeconds: number) => {
		await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
	},
};
