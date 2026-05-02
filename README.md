# Catalogus

A personal media tracker for movies, TV shows, and anime.

## Tech Stack

- **Frontend:** React 19, Vite, TanStack Start (SSR), TanStack Router, TanStack Query, Zustand, Tailwind CSS, Radix UI, Framer Motion
- **Backend:** Express.js 5, TypeScript, Prisma ORM, PostgreSQL
- **Auth:** better-auth
- **Caching:** Redis (ioredis)
- **External Data:** TMDB (The Movie Database)

## Features

- User authentication (signup/signin via better-auth)
- Track movies, TV shows, and anime
- Search media via TMDB with debounced input
- Manage watchlist with statuses (Watching, Completed, On Hold, Dropped, Plan to Watch)
- Rate (0-10) and add comments to items
- Automatic `completedAt` timestamp tracking when status changes to Completed
- View watchlist statistics (placeholder)
- Grid view mode (table view coming soon)
- Keyboard shortcut: `Cmd+K` / `Ctrl+K` to toggle search
- Redis-cached TMDB API responses (24h TTL)
- Server-side rendering via TanStack Start + Nitro

## Prerequisites

- Node.js 20+
- pnpm
- Docker & Docker Compose

## Installation

1. **Clone and install dependencies**

```bash
# Install frontend dependencies
cd frontend && pnpm install && cd ..

# Install backend dependencies
cd backend && pnpm install && cd ..
```

2. **Configure environment variables**

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your values:

```
PORT=8080
DATABASE_URL=postgresql://postgres:newpassword@localhost:5432/catalogus
DIRECT_URL=postgresql://postgres:newpassword@localhost:5432/catalogus

BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:8080
FRONTEND_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000,http://localhost:8080

TMDB_API_KEY=your-tmdb-api-key
ANILIST_API_URL=https://graphql.anilist.co

REDIS_URL=rediss://default:password@upstash-host:6379
```

3. **Start infrastructure services**

```bash
cd backend && docker-compose up -d
```

This starts PostgreSQL, Redis, Drizzle Studio (DB GUI), and RedisInsight.

4. **Run database migrations**

```bash
cd backend && npx prisma migrate dev
```

## Running the App

**Backend:**

```bash
cd backend && pnpm dev
```

Server runs at `http://localhost:8080` (or your configured PORT)

**Frontend:**

```bash
cd frontend && pnpm dev
```

App runs at `http://localhost:3000`

## Deployment (Render + Vercel + Upstash)

**Backend on Render (Web Service)**

- Root Directory: `backend`
- Build Command: `pnpm install --frozen-lockfile && pnpm build && npx prisma generate`
- Pre-Deploy Command: `npx prisma migrate deploy`
- Start Command: `pnpm start`

Set these backend environment variables in Render:

- `PORT`
- `DATABASE_URL`
- `DIRECT_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `FRONTEND_URL`
- `CORS_ORIGINS`
- `TMDB_API_KEY`
- `ANILIST_API_URL`
- `REDIS_URL`

Notes:
- Use the Render Postgres internal URL for `DATABASE_URL` when backend and database are in the same Render region.
- `DIRECT_URL` can match `DATABASE_URL` unless you need a separate direct connection URL.
- Use Upstash's Redis-compatible TLS URL for `REDIS_URL` (typically `rediss://...`) because this app uses `ioredis`.

**Frontend on Vercel**

- Root Directory: `frontend`
- Build Command: `pnpm install --frozen-lockfile && pnpm build`
- Environment Variable: `VITE_API_BASE_URL=https://your-render-backend-url.onrender.com/api`

Do not expose backend secrets in Vercel frontend environment variables.

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `ALL` | `/api/auth/{*any}` | No | Better-auth catch-all (signup, signin, session, signout) |
| `GET` | `/api/media/search?type=&q=` | No | Search TMDB (movies, TV shows) |
| `GET` | `/api/watchlist?page=&limit=&status=&type=&sort=&q=` | Yes | Get paginated, filtered, sorted watchlist |
| `POST` | `/api/watchlist` | Yes | Add item to watchlist |
| `PATCH` | `/api/watchlist/:id` | Yes | Update status, rating, or comments |
| `DELETE` | `/api/watchlist/:id` | Yes | Remove item from watchlist |

## Data Models

```
User
├── id, name, email, emailVerified, image
└── Relations: Session, Account, Wishlist

MediaItem
├── itemId, title, type (MOVIE/TV/ANIME), apiSource (TMDB/TVDB/ANILIST), apiId, metadata (JSON)
└── Unique: [apiSource, apiId]

Wishlist
├── wishlistId, userId, mediaItemId, status, rating (Decimal), completedAt, comments
└── Unique: [userId, mediaItemId]
```

## Project Structure

```
catalogus/
├── frontend/               # React frontend with SSR
│   ├── src/
│   │   ├── api/           # Axios client + API functions
│   │   ├── components/    # UI components (Radix, animate-ui, watchlist)
│   │   ├── routes/        # TanStack Router file-based routes
│   │   ├── stores/        # Zustand stores (filters, watchlist)
│   │   ├── integrations/  # TanStack Query setup
│   │   └── lib/           # Auth client, utilities
│   └── package.json
│
├── backend/               # Express API
│   ├── src/
│   │   ├── controllers/  # Route handlers
│   │   ├── routes/       # API routes
│   │   ├── services/     # TMDB service, Redis cache service
│   │   ├── schemas/      # Zod validation
│   │   ├── middleware/   # Auth middleware
│   │   ├── db/           # Prisma client with $extends
│   │   └── lib/          # Auth configuration
│   ├── prisma/           # Database schema + migrations
│   ├── bruno/            # API testing collection
│   └── package.json
│
└── README.md
```

## Infrastructure (Docker Compose)

| Service | Port | Purpose |
|---------|------|---------|
| PostgreSQL | 5432 | Primary database |
| Redis | 6379 | API response caching |
| Drizzle Studio | 4983 | Database GUI |
| RedisInsight | 5540 | Redis monitoring GUI |

## Coming Soon

- **Table view mode** — components exist, wiring in progress
- **Anime/AniList integration** — enums and scaffolding in place, search/details pending
- **Stats page** — route exists, content under construction

## License

MIT
