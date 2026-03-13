# Catalogus

A personal media tracker for movies, TV shows, and anime.

## Tech Stack

- **Frontend:** React 19, Vite, TanStack Router, TanStack Query, Tailwind CSS, Radix UI
- **Backend:** Express.js, TypeScript, Prisma ORM, PostgreSQL
- **Auth:** better-auth
- **External Data:** TMDB (The Movie Database)

## Features

- User authentication (signup/signin)
- Track movies, TV shows, and anime
- Search media via TMDB
- Manage watchlist with statuses (Watching, Completed, On Hold, Dropped, Plan to Watch)
- Rate and comment on items
- View watchlist statistics
- Grid and table view modes

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

TMDB_API_KEY=your-tmdb-api-key

REDIS_URL=redis://localhost:6379
```

3. **Start infrastructure services**

```bash
cd backend && docker-compose up -d
```

4. **Run database migrations**

```bash
cd backend && npx prisma migrate dev
```

## Running the App

**Backend:**

```bash
cd backend && pnpm dev
```

Server runs at `http://localhost:8080`

**Frontend:**

```bash
cd frontend && pnpm dev
```

App runs at `http://localhost:3000`

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `POST /api/auth/signup` | User registration |
| `POST /api/auth/signin` | User login |
| `GET /api/media/search?q=` | Search TMDB |
| `GET /api/media/:id` | Get media details |
| `GET /api/watchlist` | Get user's watchlist |
| `POST /api/watchlist` | Add item to watchlist |
| `PATCH /api/watchlist/:id` | Update watchlist item |
| `DELETE /api/watchlist/:id` | Remove from watchlist |

## Project Structure

```
catalogus/
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── routes/       # TanStack Router routes
│   │   ├── stores/       # Zustand stores
│   │   └── integrations/ # TanStack Query setup
│   └── package.json
│
├── backend/               # Express API
│   ├── src/
│   │   ├── controllers/  # Route handlers
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   ├── schemas/     # Zod validation
│   │   ├── middleware/  # Express middleware
│   │   ├── lib/         # Utilities
│   │   └── db/          # Prisma client
│   ├── prisma/          # Database schema
│   └── package.json
│
└── README.md
```

## License

MIT
