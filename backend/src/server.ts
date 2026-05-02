import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { getAllowedOrigins } from "./lib/origins.js";
import authRoutes from "./routes/auth.routes.js";
import mediaRoutes from "./routes/media.routes.js";
import watchlistRoutes from "./routes/watchlist.routes.js";

dotenv.config();

const app = express();
app.set("trust proxy", 1);

const allowedOrigins = new Set(getAllowedOrigins());

app.use(
	cors({
		origin: (origin, callback) => {
			if (!origin) {
				callback(null, true);
				return;
			}

			if (allowedOrigins.has(origin)) {
				callback(null, true);
				return;
			}

			callback(new Error("CORS origin not allowed"));
		},
		credentials: true,
	}),
);
app.use(express.json());
const port = process.env.PORT || 3000;

app.use("/api/auth", authRoutes);
app.use("/api/watchlist", watchlistRoutes);
app.use("/api/media", mediaRoutes);

app.get("/", (_, res) => {
	res.send("Catalogus Backend is running!");
});

app.listen(port, () => {
	console.log(`Server is running at port ${port}`);
});
