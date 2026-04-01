# Catalogus Frontend

React frontend for Catalogus — a personal media tracking application.

## Tech Stack

- **Framework:** React 19 with Vite 7
- **Routing:** TanStack Router (file-based) with TanStack Start for SSR
- **Data Fetching:** TanStack Query 5
- **State Management:** Zustand 5
- **Tables:** TanStack Table 8
- **Styling:** Tailwind CSS 4, Radix UI primitives, class-variance-authority
- **Animations:** Framer Motion (motion 12)
- **Icons:** lucide-react
- **Auth:** better-auth 1.4 client
- **HTTP:** Axios
- **Notifications:** Sonner
- **Linting/Formatting:** Biome

## Project Structure

```
src/
├── api/                    # Axios client + API functions
│   └── axios.ts            # Base API client (localhost:8080/api)
├── components/
│   ├── ui/                 # Base UI components (Radix primitives)
│   ├── animate-ui/         # Animated UI primitives (toggle, highlight effects)
│   ├── watchlist-components/  # Watchlist-specific components
│   ├── navbar.tsx          # Main navigation
│   ├── login-form.tsx      # Login form
│   └── signup-form.tsx     # Signup form
├── hooks/                  # Custom React hooks
├── integrations/           # TanStack Query root provider + devtools
├── lib/                    # Auth client, utilities, context helper
├── routes/                 # File-based routes (TanStack Router)
├── stores/                 # Zustand stores (filters, watchlist)
├── types/                  # TypeScript type definitions
├── router.tsx              # Router configuration
└── styles.css              # Global styles
```

## Routes

| Route | Description | Auth Required |
|-------|-------------|---------------|
| `/` | Animated landing page with hero and marquee posters | No |
| `/signin` | Login page | No |
| `/signup` | Registration page | No |
| `/about` | Project origin story page | No |
| `/watchlist` | Main watchlist with grid view, filters, pagination | Yes |
| `/stats` | Watchlist statistics (placeholder) | Yes |

## Key Components

### Watchlist
- `grid.tsx` — Main grid display with edit/delete/complete mutations
- `mediaGridCard.tsx` — Individual card with poster, status badge, hover actions
- `searchDialog.tsx` — TMDB search modal with debounced input (500ms)
- `editWatchlistDialog.tsx` — Edit status, rating (0-10), and comments
- `watchlistFilters.tsx` — Filter bar (type, status, sort, search)
- `watchlistPagination.tsx` — Pagination with ellipsis support

### State Management
- `useFilters` — Pagination, search query, type/status/sort filters
- `useWatchlistStore` — Watchlist items (data flows through TanStack Query)

## API Client

All API calls go to `http://localhost:8080/api` with `withCredentials: true`:

- `fetchWatchlist(page, limit, status, type, sort, q)` — GET `/watchlist`
- `searchMedia(type, query)` — GET `/media/search`
- `addItemToWatchlist(data)` — POST `/watchlist`
- `updateWatchlistItem(id, data)` — PATCH `/watchlist/:id`
- `deleteWatchlistItem(id)` — DELETE `/watchlist/:id`

## Available Scripts

- `pnpm dev` — Start development server with hot reload
- `pnpm build` — Build for production
- `pnpm start` — Start production server
- `pnpm test` — Run tests with Vitest
- `pnpm lint` — Run Biome linter
- `pnpm format` — Format code with Biome

## Getting Started

```bash
pnpm install
pnpm dev
```

The app runs at `http://localhost:3000`.
