# LOOP — AI customer-feedback intelligence

LOOP turns feedback from support, surveys, reviews, and sales conversations into themes, trends, grounded answers, and leadership-ready reports.

## Included

- Responsive dashboard, feedback inbox, trends, Ask LOOP, reports, settings, Help, and About.
- Light/dark theme, unified cards/tokens, friendly empty-ready UI, and no oversized assets.
- PostgreSQL/Prisma multi-tenancy: every feedback, theme, and report record belongs to a workspace.
- Admin, Analyst, and Viewer roles enforced in the feedback API.
- Credentials sign-up/sign-in, bcrypt password hashing, Auth.js JWT sessions, Zod validation, safe errors, pagination, and endpoint rate limits.
- Claude structured classification boundary. It stores classifications at ingestion; it never recomputes them during page rendering.

## Local setup

1. Copy `.env.example` to `.env` and set `DATABASE_URL` and a long `AUTH_SECRET`.
2. Run `npm install`.
3. Run `npm run db:generate`, then `npm run db:migrate -- --name init`.
4. Run `npm run db:seed` and `npm run dev`.
5. Open `http://localhost:3000`.

Set `ANTHROPIC_API_KEY` to enable live classification. Without it, ingestion remains safe and uses a neutral placeholder classification; it never sends data to an external provider.

## Seed access

All seeded accounts use `LoopDemo!2026`:

| Role | Email |
| --- | --- |
| Admin | `admin@acme.demo` |
| Analyst | `analyst@acme.demo` |
| Viewer | `viewer@acme.demo` |

## Architecture

`src/app` contains route-level UI and API handlers. `src/components` holds reusable visual building blocks. `src/lib` owns authentication, database access, permissions, rate limiting, and AI service boundaries. `prisma/schema.prisma` is the relational source of truth.

The feedback API derives workspace membership from the signed-in user, never from a browser-supplied workspace id. This is the tenant-isolation boundary. The API also constrains page sizes and validates every field before writes.

## Verification

Run `npm run lint` and `npm run build`. Use `npm audit` to review dependency advisories before deployment; do not run force fixes blindly.
