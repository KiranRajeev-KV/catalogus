# Catalogus Backend

Backend API for Catalogus built with Express.js, TypeScript, and Prisma ORM.

## Prerequisites

- Node.js (v18 or higher)
- pnpm (v10.12.1 or higher)
- PostgreSQL database

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js 5.x
- **Language**: TypeScript
- **ORM**: Prisma 7.x with PostgreSQL adapter
- **Database**: PostgreSQL
- **Validation**: Zod 4.x
- **Linter/Formatter**: Biome
- **Package Manager**: pnpm

## Project Structure

```
backend/
├── src/
│   ├── controllers/     # Request handlers and business logic
│   ├── routes/          # API route definitions
│   ├── schemas/         # Zod validation schemas
│   ├── db/              # Database configuration
│   ├── types/           # TypeScript type definitions
│   ├── generated/       # Auto-generated files
│   └── server.ts        # Application entry point
├── prisma/
│   ├── schema.prisma    # Database schema
│   ├── migrations/      # Database migration files
│   └── seed.ts          # Database seeding script
└── bruno/               # API testing collection
```

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Environment Setup

Copy the example environment file:

```bash
cp .env.example .env
```

Update the `.env` file with your configuration:

```env
PORT=8080
DATABASE_URL=<your_database_url_here>
DIRECT_URL=<your_direct_database_url_here>
```

**Environment Variables:**
- `PORT`: Server port (default: 8080)
- `DATABASE_URL`: PostgreSQL connection string for Prisma (pooled connection)
- `DIRECT_URL`: Direct database connection URL (used for migrations and introspection)

### 3. Database Setup

Run Prisma migrations to set up the database schema:

```bash
pnpm dlx prisma migrate dev
```

This will:
- Create the database if it doesn't exist
- Run pending migrations
- Generate Prisma Client

Optionally, seed the database with initial data:

```bash
pnpm dlx prisma db seed
```

### 4. Start Development Server

```bash
pnpm dev
```

The server will start on `http://localhost:8080` (or your configured PORT) with hot reload enabled.

## Available Scripts

- `pnpm dev` - Start development server with nodemon and tsx hot reload
- `pnpm format` - Format code using Biome
- `pnpm lint` - Lint code using Biome
- `pnpm check` - Run Biome checks and auto-fix issues

## Prisma Commands

- `pnpm dlx prisma studio` - Open Prisma Studio GUI to view/edit database
- `pnpm dlx prisma migrate dev` - Create and apply migrations in development
- `pnpm dlx prisma migrate deploy` - Apply migrations in production
- `pnpm dlx prisma db push` - Push schema changes without creating migrations
- `pnpm dlx prisma db seed` - Seed the database with initial data
- `pnpm dlx prisma generate` - Generate Prisma Client