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
- **ORM**: Prisma 7.x
- **Database**: PostgreSQL
- **Linter/Formatter**: Biome
- **Package Manager**: pnpm

## Installation

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Environment Setup**
   
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

   Update the `.env` file with your configuration:
   ```env
   PORT=8080
   DATABASE_URL=
   DIRECT_URL=
   ```

   - `PORT`: The port on which the server will run (default: 8080)
   - `DATABASE_URL`: PostgreSQL connection string for Prisma
   - `DIRECT_URL`: Direct database connection URL (used for migrations)

3. **Database Setup**
   
   Run Prisma migrations to set up the database schema:
   ```bash
   pnpm dlx prisma migrate dev
   ```

   Generate Prisma Client:
   ```bash
   pnpm dlx prisma generate
   ```

## Development

Start the development server with hot reload:
```bash
pnpm dev
```

The server will start on `http://localhost:8080` (or your configured PORT).

## Available Scripts

- `pnpm dev` - Start development server with nodemon hot reload
- `pnpm format` - Format code using Biome
- `pnpm lint` - Lint code using Biome
- `pnpm check` - Run Biome checks and auto-fix issues

## Prisma Commands

- `pnpm dlx prisma studio` - Open Prisma Studio to view/edit database
- `pnpm dlx prisma migrate dev` - Create and apply migrations in development
- `pnpm dlx prisma migrate deploy` - Apply migrations in production
- `pnpm dlx prisma generate` - Generate Prisma Client
- `pnpm dlx prisma db push` - Push schema changes without migrations
