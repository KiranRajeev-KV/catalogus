const LOCAL_ORIGINS = ["http://localhost:3000", "http://localhost:8080"];

const parseCsvEnv = (value?: string): string[] => {
	if (!value) return [];
	return value
		.split(",")
		.map((part) => part.trim())
		.filter((part) => part.length > 0);
};

export const getAllowedOrigins = (): string[] => {
	const originSet = new Set<string>([
		...LOCAL_ORIGINS,
		...parseCsvEnv(process.env.FRONTEND_URL),
		...parseCsvEnv(process.env.BETTER_AUTH_URL),
		...parseCsvEnv(process.env.CORS_ORIGINS),
	]);

	return Array.from(originSet);
};
