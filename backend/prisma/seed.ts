// prisma/seed.ts
import { Status, Type, ApiSource } from "../src/generated/prisma/client.js";
import { prisma } from "../src/db/client.js";

// Dummy Data Arrays for variety
const TITLES = [
	"Attack on Titan",
	"Breaking Bad",
	"Inception",
	"Arcane",
	"One Piece",
	"The Dark Knight",
	"Stranger Things",
	"Spirited Away",
	"Interstellar",
	"Squid Game",
	"Naruto",
	"The Matrix",
	"Cyberpunk: Edgerunners",
	"Friends",
	"Your Name",
	"The Witcher",
	"Demon Slayer",
	"Avengers: Endgame",
	"Parasite",
	"Black Mirror",
];

const SOURCES = [
	ApiSource.TMDB,
	ApiSource.ANILIST,
	ApiSource.MDL,
	ApiSource.TVDB,
];
const TYPES = [Type.MOVIE, Type.TV, Type.ANIME, Type.DRAMA];
const STATUSES = [
	Status.PLAN_TO_WATCH,
	Status.WATCHING,
	Status.COMPLETED,
	Status.DROPPED,
	Status.ON_HOLD,
];

async function main() {
	console.log("🌱 Starting seed...");

	// 1. CLEANUP: Remove old data
	await prisma.wishlist.deleteMany();
	await prisma.mediaItem.deleteMany();
	await prisma.user.deleteMany();
	console.log("🧹 Database cleared.");

	// 2. CREATE USER
	const userId = "user_123_placeholder";
	await prisma.user.create({
		data: {
			user_id: userId,
			username: "test_user",
			email: "test@example.com",
			password: "hashed_password_123", // Dummy password
		},
	});
	console.log(`👤 Created user: ${userId}`);

	// 3. GENERATE ITEMS
	const promises: Promise<any>[] = [];

	for (let i = 0; i < 50; i++) {
		const randomTitle = TITLES[i % TITLES.length] + (i > 19 ? ` ${i}` : "");
		const randomType = TYPES[Math.floor(Math.random() * TYPES.length)];
		const randomSource = SOURCES[Math.floor(Math.random() * SOURCES.length)];
		const randomStatus = STATUSES[Math.floor(Math.random() * STATUSES.length)];
		const randomScore = Math.floor(Math.random() * 100) / 10; // 0.0 to 10.0

		// 1️⃣ Create MediaItem
		const mediaItemPromise = prisma.mediaItem.create({
			data: {
				title: randomTitle,
				type: randomType,
				api_source: randomSource,
				api_id: `seed_${i}`,
				metadata: {
					year: 2000 + Math.floor(Math.random() * 24),
					studio: "Random Studio",
					genres: ["Action", "Drama"],
				},
			},
		});

		// 2️⃣ After MediaItem is created, create Wishlist entry
		const wishlistPromise = mediaItemPromise.then((mediaItem) =>
			prisma.wishlist.create({
				data: {
					user_id: userId,
					media_item_id: mediaItem.item_id,
					status: randomStatus,
					rating: randomScore,
				},
			}),
		);

		promises.push(wishlistPromise);
	}

	await Promise.all(promises);
	console.log(`✅ Seeded 50 items into Wishlist.`);
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
