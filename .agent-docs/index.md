# Common Ground navigation

- `README.md`: run commands, verification, publication gates.
- `lib/domain.ts`: request validation, fictional sample model, shortlist ranking, text export.
- `lib/qloo.ts`: official harness adapter, strict source normalization, no credential fallback.
- `lib/planning-agent.ts`: bounded OpenAI Agents SDK host, read-only Qloo identity lookups and constraint review.
- `lib/agent-contract.ts`: bounded model input, output validation and persisted report schema.
- `tests/agent-contract.test.ts`: name omission and evidence/identity guard checks; offline.
- `components/ai-elements/plan.tsx`: official AI Elements Plan adapted to static reports without motion dependency.
- `ENTRY_DRAFT.md`: truthful local contest story; no publication or submission claim.
- `RELEASE_PLAN.md`: exact proposed public repository, source approval and hosting/usage gates.
- `lib/qloo-client.ts`: fixed hackathon HTTP transport, strict locality boundary, bounded/paced calls, no redirects or retries.
- `components/planning-workspace.tsx`: complete interactive workspace and accessible Radix dialogs.
- `app/api/plan/route.ts`: bounded request validation and explicit live-access gate.
- `app/api/saved/route.ts`: browser-owned private collection, Prisma persistence, HttpOnly random token.
- `lib/auth.ts`, `app/api/auth/[...all]/route.ts`: Better Auth foundation; account creation disabled.
- `scripts/db-create.mjs`, `prisma/`: isolated local database setup and additive migration.
- `tests/domain.test.ts`: domain/provider contract tests, no live calls.
- `tests/qloo-client.test.ts`: transport destination, credential placement, error privacy and response bounds with mocked fetch only.
- `tests/api-smoke.ts`: actual local HTTP/database checks, writes a fictional fixture to its own test collection.

User explicitly approved reuse of the configured OpenAI key on October 21. The agent loop is implemented and live-verified with gpt-6-luna, read-only Qloo tools, mandatory constraint review and structured identity-bound selection. No model secret was copied or printed. Qloo and agent flags are enabled locally in ignored .env; the OpenAI key comes from the existing server environment. No public deployment or Qloo submission exists. Before a public release, obtain concrete publication/destination approval and implement shared public-demo usage enforcement; local process locks are insufficient for a scaled public service.

Latest: publication and named Vercel secret transfer approved, with $5 maximum model credit. Shared quotas are in lib/usage.ts with an additive UsageCounter migration; compare logic is lib/coverage.ts and lib/qloo-coverage.ts. Production schema/TLS verified, Vercel project limit awaiting empty-template repurposing approval. Earlier pending-approval statements above are superseded.
