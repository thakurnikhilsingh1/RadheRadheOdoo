# TransitOps

A fleet management application: track vehicles, drivers, trips, maintenance, fuel, and expenses.

## Architecture

- **frontend/** — React 19 + Vite, Tailwind, Radix UI. Runs on port 5000 (workflow: `Frontend`).
  Currently defaults to browser `localStorage` for data (see `frontend/src/services/storage.js`)
  unless `VITE_API_BASE_URL` is set. Left as-is per user request; not wired to the backend yet.
- **backend/** — Express 5 + MongoDB/Mongoose REST API. Runs on port 8080 (workflow: `Backend`).
  Resource-based routes (`/api/vehicles`, `/api/drivers`, `/api/trips`, `/api/maintenance`,
  `/api/fuel`, `/api/expenses`, `/api/dashboard`, `/api/auth`), snake_case field names, JWT auth,
  role-based access control (`Admin`, `Fleet Manager`, plus a general authenticated role),
  express-validator request validation, centralized error handling (`ApiError` +
  `errorHandler.js`), helmet, rate limiting, morgan logging, CORS via `CORS_ORIGIN` env,
  health check at `/api/health`, graceful shutdown on SIGINT/SIGTERM.
  Status transitions (dispatch/complete/cancel trips, maintenance open/close) run inside
  Mongoose transactions to reimplement the atomicity the old Postgres triggers provided.

## Environment / secrets

- `MONGODB_URI` — MongoDB connection string (required).
- `JWT_SECRET` — JWT signing secret (required; server refuses to start without it).
- `PORT` — backend port, defaults to 8080.
- `CORS_ORIGIN` — comma-separated allowed origins, defaults to `*`.

## Running

- `npm run dev` in `frontend/` (port 5000) and `npm start` in `backend/` (port 8080) — both bound
  to Replit workflows `Frontend` and `Backend`.
- `npm run seed` in `backend/` seeds demo users, vehicles, drivers, trips, maintenance, fuel and
  expense records. Demo login: any seeded user email (e.g. `admin@transitops.com`) with password
  `Passw0rd!`.

## Known gap / follow-up

The frontend's data-access layer (`frontend/src/services/*`) speaks a different contract than the
backend (generic collections, camelCase, PATCH vs. the backend's resource-specific routes,
snake_case, PUT). Reconciling frontend and backend was out of scope for the backend
overhaul/Mongo migration and is a good candidate follow-up task.

## User preferences

- Frontend should be left as-is unless the user explicitly asks for changes to it.
