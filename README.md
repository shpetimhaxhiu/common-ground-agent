# Common Ground

A group-outing planner for the Qloo Agentic Hackathon. Bring two to four explicit taste profiles together, inspect trade-offs, revise a shortlist, and save or copy a plan.

**Public source:** https://github.com/shpetimhaxhiu/common-ground-agent (MIT). **Hosted demo:** https://common-ground-agent.vercel.app — public, no Vercel login required. **Submitted contest entry:** https://devpost.com/software/common-ground-xauf3m .

**Status: submitted; public live Qloo flow verified.** The default workspace starts with the real Qloo comparison, without making any provider call until requested. Qloo resolves explicit tastes, discovers real places and supplies per-profile affinities. The visible evidence trail shows resolved meanings, result identities and the app's separate balance rule. Ambiguous meanings have plain-language categories and an explicit confirmation action; identifiers stay in an inspectable detail section. Equal affinities are explained as ties, not strong personal matches. The fictional Prishtina example remains separately labeled. The optional bounded agent interprets Qloo evidence and inspects candidates; it does not supply the underlying places or affinity scores. Sample and agent plan save/reload/reopen are verified. See VERIFICATION.md for dated release evidence and limitations.

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

The adapter uses `createDirectQlooWorkflowExecutor` / `recommend` from official harness 0.1.26 with an explicit event-only HTTP transport. Requests use X-Api-Key, reject redirects, never read global Qloo configuration, and write no harness execution logs. The transport sets documented `filter.location.radius=0`; names are still fuzzy-matched by Qloo, so use a precise city name and verify addresses. Direct-mode provider order and identity are retained; explicit entity exclusions are applied without invented replacements. Ambiguous tag meanings become user choices; unknown interests need editing. Prices, noise, individual fit and availability remain unknown. Agent mode may reorder or narrow those options and labels its editorial suggestions separately. OpenAI Agents SDK runs the model loop; AI Elements provides the report UI. The AI SDK guidance was followed, but no second AI SDK model loop is used.

Live calls are bounded to eight distinct interests, ten upstream requests per workflow and 45 seconds total. A 150ms spacing between upstream starts and a single in-flight workflow per process reduce rate pressure. Successful results use a bounded private five-minute in-memory cache with no guest names. Additional per-profile comparison and identity inspection use a second bounded transport. Shared PostgreSQL counters constrain public workflows across instances. No raw provider responses belong in a public repository; opt-in smoke evidence stays in ignored `.runtime/`.

The official Node harness must remain external in Next.js (`serverExternalPackages`) because it loads filesystem resources. A deployment needs a compatible Node runtime and its dependencies; it cannot be exported as a static website. Budget/quietness refinements are demonstrated only against fictional fixtures. Do not imply these attributes are verified for Qloo places.


## Planning agent

The user explicitly approved reuse of the existing server OPENAI_API_KEY on October 21. No model secret was copied to a new file. Enable with ENABLE_PLANNING_AGENT=true; choose Live Qloo, then Agent · inspect and compare. Guest names and internal guest IDs stay local; city, date/time, budget target, explicit interests and bounded provider descriptions go to OpenAI. The model ID gpt-6-luna was verified through this account’s model list and a successful run.

The agent first compares the same shortlist across every explicit interest profile, then can inspect up to three candidate identities through Qloo /entities and must inspect at least two (or the sole result) before a constraint review. It then returns a structured selection. Server validation rejects duplicates, invented/excluded/uninspected IDs, missing evidence checks and malformed decisions. Editorial comments remain unverified suggestions. It has no booking, payment, email, shell or arbitrary URL tools.

Each model phase is capped at 75 seconds, six model calls and 1,200 output tokens per call. SDK retries, tracing and Responses storage are disabled. A process-local single-run lock and 15-second cooldown reduce accidental repeats. Ambiguity preflight happens before model calls. PostgreSQL serializes reservations across server instances. The approved $5 allocation reserves $0.05 for each of at most 90 public agent attempts ($4.50), leaving $0.50 for release verification. Each model request is bounded to 40,000 serialized UTF-8 bytes; six calls at standard gpt-6-luna pricing ($0.10/M input, $0.50/M output, verified October 21) fit conservatively within that reservation, including token/framing margin. Failed attempts keep their reservations. Streaming and automatic retries are disabled. Pricing changes require revalidation before raising limits. Qloo planning is capped at 100 public attempts per UTC day, eight per hashed visitor/day. Database failures fail closed; sample mode remains available.

Explicit live verification: pnpm exec tsx scripts/agent-smoke.ts. It consumes Qloo/model quota and stores raw evidence only in ignored .runtime/. Offline tests never use real provider credentials.

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

Public source publication is approved. The user approved repurposing the empty Vercel template as common-ground-agent and a $5 demo budget. Production secrets are stored as sensitive variables. Public hosting and end-to-end live planning are verified. A contest-ready release needs real Qloo use, required agent behavior, a public functional demo, a detectable open-source license and a truthful entry. Final prize entry is a user handoff. Rules: https://qloo.devpost.com/rules

Official references: https://github.com/qloo/qloo-hackathon-kit ; https://better-auth.com/docs/adapters/prisma ; installed Next.js docs in `node_modules/next/dist/docs`.

Original code is prepared under [MIT](LICENSE); adapted UI components retain the notices in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). See [RELEASE_PLAN.md](RELEASE_PLAN.md) for the proposed public repository and hosting gates, and [ENTRY_DRAFT.md](ENTRY_DRAFT.md) for the local contest story. The public source and demo links above are verified.

Qloo access and location references: https://docs.qloo.com/reference/qloo-llm-hackathon-developer-guide ; https://docs.qloo.com/reference/parameters . Both were read in the authenticated Chrome session on October 21.

## Transparent group comparison

Choose **Try a real comparison**, then **Find common ground**. This loads illustrative Jazz/Coffee inputs for New York City; all venue results and affinity signals come from fresh Qloo calls. The comparison approach makes no OpenAI calls. It scores the same three candidate IDs once per explicit interest profile, ranks scores within each column, and orders complete rows by their worst rank, breaking ties by rank sum. Missing data cannot win. Ties do not imply personal compatibility. The agent calls this comparison tool before inspecting identities and must retain the first balanced candidate as its first suggestion.

The production database uses a project-only schema and Hetzner’s published PostgreSQL CA in certs/hetzner-sql-ca.pem, with certificate and hostname verification enabled. Credentials remain private. Source: https://docs.hetzner.com/managed/databases/postgresql/ .

Read-only Qloo GETs may retry once after a network disconnect, interrupted response body, or HTTP 502/503/504. Both attempts count toward the existing ten-call transport budget and share the original abort deadline; a retry does not extend either limit. Authentication, rate limits, invalid responses, model calls and quota transactions never retry automatically. Response-stream cleanup cannot replace a safe provider error with a raw exception. Planning failures log only a fixed pipeline stage and elapsed milliseconds. An unavailable allowance database returns 503 and fails closed before any provider call, rather than blaming the provider or bypassing the shared limits.

Shared counter integration check (writes isolated test counter rows, no model/provider calls): `pnpm exec tsx scripts/usage-smoke.ts`. Production-build HTTP checks can use `CG_TEST_BASE` to target a separately running instance; the default remains loopback port 3161.

## Deployment

Vercel project **common-ground-agent**, scope **shpetimhaxhius-projects**. The empty next-js-saas-starter-template was repurposed with explicit approval; no project was deleted or paid plan activated. Canonical demo: https://common-ground-agent.vercel.app . Production-only sensitive variables: DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL, QLOO_API_KEY, OPENAI_API_KEY, ENABLE_LIVE_QLOO, ENABLE_PLANNING_AGENT. Never use public-prefixed provider keys.

Deploy with `pnpm dlx vercel@64.7.0 deploy --prod --yes --scope shpetimhaxhius-projects --project prj_hOV7qS2tjgCdiswz04tA0qlLxRM1`. Git metadata on the reused project is still managed by v0; Vercel rejected direct Git reconnection. This release uses the verified local GitHub source through the CLI. GitHub pushes alone are not the deployment workflow, and the old v0 project should not be published over this release. No other template service or database was modified. pnpm-workspace.yaml declares required trusted install scripts and explicitly disables unrelated ones.

To review: open the public app, choose **Try a real comparison**, then **Find common ground**. Choose **Agent · inspect and compare** to exercise real model/tool planning. Choose a place, save, refresh and open Saved plans. The live example chooses a date three days ahead; the separately labeled fictional sample is fixed. Venue conditions remain unverified. Shared daily/total allowances are documented above; provider failures are explicit.

October 24 deployment note: the same Vercel team ID now has slug brainglow-projects. Use that current scope for deploy/promote/inspect; project ID and canonical public demo URL are unchanged. Application repair commit b9460fa is the verified production release; see VERIFICATION.md.
