# Common Ground

A local group-outing planner for the Qloo Agentic Hackathon. Bring two to four explicit taste profiles together, inspect trade-offs, revise a shortlist, and save or copy a plan.

**Status: live Qloo planning verified locally; not a completed contest entry.** The issued event key works, and live recommendations, interest clarification and private saved-plan persistence have been exercised in Chrome. The fictional sample remains separately labeled. No model-driven agent loop is active; a configured OpenAI key was detected, but reuse authorization is pending and no model call has been made.

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
- Query real Qloo places, clarify ambiguous tag meanings, and use precise city names. Live results keep prices, quietness and individual fit unknown.
- Rehearse quieter/cheaper alternatives, exclude a place, or restore it.
- Open a plan with explicit unknowns, save to PostgreSQL and reopen after refresh.
- Browser-owned collections use a random HttpOnly cookie and its hash in the database. Clearing site data disconnects the collection; there is no account recovery or cross-device sync.
- Copy a plan, or open its complete selectable text when the clipboard is unavailable.
- Better Auth foundation is installed and database-backed; account creation is disabled. No user login is needed or claimed.

Sample sorting is an explicit rule-based calculation, not an AI recommendation. All venues and costs are fictional. No booking, payment, email or venue contact happens.

## Qloo integration gate

API access email from hackathon@qloo.com was verified on October 21, 2026 (message dated October 20, 23:47). The issued key is configured only in the Git-ignored local .env; live mode is enabled locally. The official developer guide says event keys remain active through judging. A successful authentication probe reported 50,000 requests/month and 10/second; 49,999 monthly requests remained immediately after that first probe. This is a verification snapshot, not a current balance. Keep the key only in a server-side secret, never a browser field, public variable, screenshot or model prompt. The app requires both `QLOO_API_KEY` and `ENABLE_LIVE_QLOO=true`; a missing key or failed request never falls back to fixtures. Participant names are not sent to Qloo; only explicit cultural-interest strings and the requested city are used.

The adapter uses `createDirectQlooWorkflowExecutor` / `recommend` from official harness 0.1.26 with an explicit event-only HTTP transport. Requests use X-Api-Key, reject redirects, never read global Qloo configuration, and write no harness execution logs. The transport sets documented `filter.location.radius=0`; names are still fuzzy-matched by Qloo, so use a precise city name and verify addresses. Provider order and identity are retained; explicit entity exclusions are applied without invented replacements. Ambiguous tag meanings become user choices; unknown interests need editing. Prices, noise, individual fit and availability remain unknown. Actual agent orchestration is still required before competition claims. AI SDK and OpenAI Agents packages are installed but unused.

Live calls are bounded to eight distinct interests, ten upstream requests per workflow and 45 seconds total. A 150ms spacing between upstream starts and a single in-flight workflow per process reduce rate pressure. Successful results use a bounded private five-minute in-memory cache with no guest names. This is local-demo protection, not a distributed public-deployment quota control. No raw provider responses belong in a public repository; opt-in smoke evidence stays in ignored `.runtime/`.

The official Node harness must remain external in Next.js (`serverExternalPackages`) because it loads filesystem resources. A deployment needs a compatible Node runtime and its dependencies; it cannot be exported as a static website. Budget/quietness refinements are demonstrated only against fictional fixtures. Do not imply these attributes are verified for Qloo places.

## Checks

```sh
pnpm test
pnpm typecheck
pnpm lint
pnpm build
# With the local dev server running:
pnpm exec tsx tests/api-smoke.ts
# Optional: exercise the disabled-live gate when ENABLE_LIVE_QLOO=false:
pnpm exec tsx tests/api-smoke.ts --expect-live-disabled
# Explicit live test (consumes Qloo event quota; writes ignored private evidence):
pnpm exec tsx scripts/qloo-smoke.ts
```

See [VERIFICATION.md](VERIFICATION.md) for evidence and remaining limits. The HTTP smoke test adds a fictional fixture to an isolated cookie collection, never the user's collection.

## Design and delivery

Next.js App Router scaffolded with the shadcn CLI, Radix primitives, React, Tailwind 4, Prisma/PostgreSQL and Better Auth. Editorial parchment/ink/copper direction, system sans and Georgia (no external font requests), original CSS artwork. No stock venue photographs or misleading imagery.

No public repo or deployment exists yet. Obtain approval for the concrete publication destination after live integration is reviewable. A contest-ready release needs real Qloo use, required agent behavior, a public functional demo, a detectable open-source license and a truthful entry. Final prize entry is a user handoff. Rules: https://qloo.devpost.com/rules

Official references: https://github.com/qloo/qloo-hackathon-kit ; https://better-auth.com/docs/adapters/prisma ; installed Next.js docs in `node_modules/next/dist/docs`.

Qloo access and location references: https://docs.qloo.com/reference/qloo-llm-hackathon-developer-guide ; https://docs.qloo.com/reference/parameters . Both were read in the authenticated Chrome session on October 21.
