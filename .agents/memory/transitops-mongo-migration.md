---
name: TransitOps Postgres to MongoDB migration
description: Decisions made when migrating the TransitOps backend from Postgres to MongoDB/Mongoose, and the known frontend/backend contract mismatch.
---

## Decisions

- Kept the existing resource-specific REST shape (`/api/vehicles`, `/api/drivers`, `/api/trips`,
  etc., PUT for updates, snake_case field names) instead of switching to match the frontend's
  generic-collection/camelCase/PATCH contract used in `frontend/src/services/*`.
  **Why:** reconciling the two contracts was explicitly out of scope for the backend/DB migration
  task; the frontend was to be left as-is. **How to apply:** if a future task asks to connect the
  frontend to the real backend, that reconciliation (or an adapter layer) still needs doing — it
  was never built.
- Old Postgres trigger logic (vehicle/driver availability, cargo capacity, license expiry,
  status transitions on dispatch/complete/cancel/maintenance) was reimplemented in the Node/
  Mongoose application layer using `session.withTransaction`.
  **Why:** Mongo has no trigger equivalent; transactions need a replica set, which Atlas provides
  by default even on the free tier. **How to apply:** any new multi-document status-transition
  logic on this backend should follow the same transaction pattern rather than relying on
  post-hoc consistency checks.
- Frontend runs on port 5000 (webview workflow), backend runs on port 8080 (console workflow) —
  kept separate because the frontend hardcodes port 5000 and defaults to localStorage unless
  `VITE_API_BASE_URL` is set.
