import dotenv from "dotenv";
import express from "express";
import itemsRoutes from "./routes/items.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";

dotenv.config();

const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;

app.use("/api/wishlist", wishlistRoutes);
app.use("/api/items", itemsRoutes);

app.get("/", (_, res) => {
	res.send("Catalogus Backend is running!");
});

app.listen(port, () => {
	console.log(`Server is running at port ${port}`);
});
