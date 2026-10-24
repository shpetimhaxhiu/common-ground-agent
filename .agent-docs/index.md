# Common Ground navigation

- `README.md`: run commands, verification, publication gates.
- `lib/domain.ts`: request validation, fictional sample model, shortlist ranking, text export.
- `lib/qloo.ts`: official harness adapter, strict source normalization, no credential fallback.
- `lib/planning-agent.ts`: bounded OpenAI Agents SDK host, read-only Qloo identity lookups and constraint review.
- `lib/agent-contract.ts`: bounded model input, output validation and persisted report schema.
- `tests/agent-contract.test.ts`: name omission and evidence/identity guard checks; offline.
- `components/ai-elements/plan.tsx`: official AI Elements Plan adapted to static reports without motion dependency.
- `ENTRY_DRAFT.md`: prepared contest story and verified submission status.
- `lib/cultural-seeds.ts`, `lib/qloo-seeds.ts`: typed cultural selections, Qloo identity/type verification and bounded public match records.
- `components/cultural-picker.tsx`, `app/api/tastes/route.ts`: explicit artist/film/book search and selection; same-origin access and shared daily limits.
- `tests/cultural-seeds.test.ts`: entity-only harness regression, identity/type validation, affinity input and agent-context coverage.
- `RELEASE_PLAN.md`: exact proposed public repository, source approval and hosting/usage gates.
- `lib/qloo-client.ts`: fixed hackathon HTTP transport, strict locality boundary, bounded/paced calls, no redirects; one transient read-only retry within the existing deadline/call cap, credential-free stream errors.
- `tests/planning-allowance.test.ts`: allowance database failure stays closed before provider calls and logs no request/error contents.
- `components/planning-workspace.tsx`: complete interactive workspace and accessible Radix dialogs.
- `components/qloo-evidence.tsx`: visible live Qloo taste → places → affinity evidence, with source identifiers behind details.
- `lib/qloo-presentation.ts`: live example, human-readable taxonomy categories and explicit tied/missing signal summaries.
- `app/page.tsx`: request-time date and live/agent availability flags; no automatic provider call.
- `app/api/plan/route.ts`: bounded request validation and explicit live-access gate.
- `app/api/saved/route.ts`: browser-owned private collection, Prisma persistence, HttpOnly random token.
- `lib/auth.ts`, `app/api/auth/[...all]/route.ts`: Better Auth foundation; account creation disabled.
- `scripts/db-create.mjs`, `prisma/`: isolated local database setup and additive migration.
- `tests/domain.test.ts`: domain/provider contract tests, no live calls.
- `tests/qloo-client.test.ts`: transport destination, credential placement, error privacy and response bounds with mocked fetch only.
- `tests/api-smoke.ts`: actual local HTTP/database checks, writes a fictional fixture to its own test collection.

Current release state: public MIT source https://github.com/shpetimhaxhiu/common-ground-agent. Named Vercel secret transfer and $5 maximum existing model credit approved. Shared quotas: lib/usage.ts with UsageCounter migration; comparison: lib/coverage.ts, lib/qloo-coverage.ts. Production schema/TLS and public API persistence verified. User approved repurposing the empty Vercel template; app live at https://common-ground-agent.vercel.app . Scoped CLI deployment is documented in README; Git connection remains v0-managed. Qloo entry submitted by the user and confirmed October 24: https://devpost.com/software/common-ground-xauf3m . Preserve local collections. The October 24 reliability follow-up adds safe pipeline-stage diagnostics and bounded read-only Qloo recovery; see VERIFICATION.md for release evidence and remaining uncertainty.
