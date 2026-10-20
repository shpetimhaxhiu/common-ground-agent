# Common Ground

A local group-outing planner for the Qloo Agentic Hackathon. Bring two to four explicit taste profiles together, inspect trade-offs, revise a shortlist, and save or copy a plan.

**Status: working fictional sample, not a completed contest entry.** The event API key is pending. No model-driven agent loop is active. The server-side Qloo adapter is prepared against official harness 0.1.26 but has not made a live call. The UI clearly labels fictional places, prices and conditions; no fake live fallback.

## Run locally

Requires Node >=22.19, pnpm, and an existing local PostgreSQL server on loopback port 5432. Dependencies are pinned by `pnpm-lock.yaml`; Prisma CLI and client both use 7.10.1.

```sh
pnpm install --frozen-lockfile
pnpm db:setup
pnpm dev
```

Open http://127.0.0.1:3161. The app binds only to loopback. Stop with Ctrl+C in its server terminal. For a first setup, `scripts/db-create.mjs` creates the isolated database `dev_common_ground_0de47d517752`, a project-only non-superuser role, and ignored `.env` configuration. It refuses unknown existing targets and never changes PostgreSQL services or authentication rules. Local admin setup assumes the verified `postgres` role can connect without an interactive password; adapt privately if another machine differs. The role owns its new tables; the local admin owns the database.

`pnpm db:setup` is repeatable: verify target, apply committed migrations, regenerate Prisma. No reset, truncation or shared-schema migration. `.env.example` contains placeholders only. Never commit `.env`, `.runtime`, generated clients or credentials.

## Working flows

- Edit 2–4 people, interests, city, date/time and budget.
- Generate a fictional Prishtina sample with per-person exact-tag overlap.
- Rehearse quieter/cheaper alternatives, exclude a place, or restore it.
- Open a plan with explicit unknowns, save to PostgreSQL and reopen after refresh.
- Browser-owned collections use a random HttpOnly cookie and its hash in the database. Clearing site data disconnects the collection; there is no account recovery or cross-device sync.
- Copy a plan, or open its complete selectable text when the clipboard is unavailable.
- Better Auth foundation is installed and database-backed; account creation is disabled. No user login is needed or claimed.

Sample sorting is an explicit rule-based calculation, not an AI recommendation. All venues and costs are fictional. No booking, payment, email or venue contact happens.

## Qloo integration gate

The approved organizer API-key request was received. Keep the key only in a server-side secret, never a browser field, public variable, screenshot or model prompt. Before live use, verify the issued quota, expiration and event conditions. The app requires both `QLOO_API_KEY` and `ENABLE_LIVE_QLOO=true`; a missing key or failed request never falls back to fixtures. Participant names are not sent to Qloo; only explicit cultural-interest strings and the requested city are used.

The adapter uses `createDirectQlooWorkflowExecutorFromEnvironment` / `recommend` from the official harness. It preserves provider ordering and source identity, excludes explicitly rejected IDs, rejects ambiguous or malformed outputs, and keeps unknown real-world prices and conditions unknown. Live integration, entity-resolution UX, actual agent orchestration and its model credentials still need implementation/verification before competition claims. AI SDK and OpenAI Agents packages are installed but unused; there is no OpenAI API call or configured key.

The official Node harness must remain external in Next.js (`serverExternalPackages`) because it loads filesystem resources. A deployment needs a compatible Node runtime and its dependencies; it cannot be exported as a static website. Budget/quietness refinements are demonstrated only against fictional fixtures. Do not imply these attributes are verified for Qloo places.

## Checks

```sh
pnpm test
pnpm typecheck
pnpm lint
pnpm build
# With the local dev server running:
pnpm exec tsx tests/api-smoke.ts
```

See [VERIFICATION.md](VERIFICATION.md) for evidence and remaining limits. The HTTP smoke test adds a fictional fixture to an isolated cookie collection, never the user's collection.

## Design and delivery

Next.js App Router scaffolded with the shadcn CLI, Radix primitives, React, Tailwind 4, Prisma/PostgreSQL and Better Auth. Editorial parchment/ink/copper direction, system sans and Georgia (no external font requests), original CSS artwork. No stock venue photographs or misleading imagery.

No public repo or deployment exists yet. Obtain approval for the concrete publication destination after live integration is reviewable. A contest-ready release needs real Qloo use, required agent behavior, a public functional demo, a detectable open-source license and a truthful entry. Final prize entry is a user handoff. Rules: https://qloo.devpost.com/rules

Official references: https://github.com/qloo/qloo-hackathon-kit ; https://better-auth.com/docs/adapters/prisma ; installed Next.js docs in `node_modules/next/dist/docs`.
