# WebAppTCC

Monorepo da plataforma de gestão de TCC (FT Unicamp) com duas aplicações independentes:

- `apps/api`: backend NestJS + Prisma (PostgreSQL)
- `apps/web`: frontend Vue 3 + Vite

## Replit Setup

### Workflows

- **Backend** — `cd apps/api && npm run start:dev` — NestJS API listening on `localhost:3000`. Console output. Swagger UI at `/api/docs` on the backend port.
- **Frontend** — `cd apps/web && npm run dev` — Vite dev server bound to `0.0.0.0:5000` (the only public port). Webview output.

The frontend proxies all `/api/*` requests to the backend (see `apps/web/vite.config.js`). The browser only ever talks to port 5000.

### Database

The project uses Replit's managed PostgreSQL (`DATABASE_URL` is set automatically). The schema was applied with `npx prisma db push` (the existing migration is an "alter table" migration that assumed a pre-existing schema and could not be applied to a fresh database).

Seed users (created via `apps/api/seed.ts`):

- aluno@unicamp.br / 123456 (STUDENT)
- professor@unicamp.br / 123456 (TEACHER)
- coord@unicamp.br / 123456 (COORDINATOR)

### Frontend ↔ Backend Wiring

- `apps/web/src/services/api.js` uses `baseURL: '/api'` so requests go through the Vite proxy.
- `apps/web/vite.config.js` rewrites `/api/*` → backend root and sets `host: '0.0.0.0'`, `port: 5000`, `allowedHosts: true` (required for Replit's iframe proxy).
- Backend has `app.enableCors()` already enabled.

### Deployment

Configured for Autoscale: build runs `npm install` in both apps + `prisma generate` + `prisma db push`; runtime starts both API and web preview on port 5000.

## User Preferences

(none recorded yet)
