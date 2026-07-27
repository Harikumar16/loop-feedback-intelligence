# LOOP implementation plan

## Product scope
LOOP is a multi-tenant customer-feedback intelligence platform. This implementation covers a protected product shell, analytics dashboard, feedback inbox and ingestion, trends, grounded Ask LOOP, saved reports, workspace settings, Help, and About.

## Delivery checkpoints
1. Foundation: application structure, design tokens, database schema, RBAC policy, and environment safety.
2. Product UI: responsive app shell, light/dark themes, dashboard, inbox, trends, Ask LOOP, reports, settings, Help, and About.
3. Secure services: authenticated route handlers, tenant scoping, validation, pagination, rate limits, ingestion, and AI service boundaries. Completed for sign-up and feedback access.
4. Verification: lint/build, responsive states, empty/error states, and setup documentation. Completed; final production build passed.

## Security contract
- Every database query receives the authenticated workspace id; IDs from the browser never determine tenancy.
- Admins manage workspace members. Analysts can create and update feedback. Viewers have read-only access.
- Passwords are hashed by Auth.js credentials provider; secrets are environment variables only.
- All route input is validated with Zod. Mutating endpoints have rate limits and return safe client errors.
- CSV imports enforce row limits, byte limits, field validation, and partial-failure reporting.

## Required environment
Copy `.env.example` to `.env`. Set a PostgreSQL `DATABASE_URL`, `AUTH_SECRET`, and (to enable live AI) `GEMINI_API_KEY`.

## Implementation note
The UI includes rich demo data so the product can be evaluated before a database/API key is configured. Production route handlers and Prisma schema are included for the live integration path.
