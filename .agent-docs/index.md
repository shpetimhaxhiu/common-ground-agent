# Common Ground navigation

- `README.md`: run commands, verification, publication gates.
- `lib/domain.ts`: request validation, fictional sample model, shortlist ranking, text export.
- `lib/qloo.ts`: official harness adapter, strict source normalization, no credential fallback.
- `lib/qloo-client.ts`: fixed hackathon HTTP transport, strict locality boundary, bounded/paced calls, no redirects or retries.
- `components/planning-workspace.tsx`: complete interactive workspace and accessible Radix dialogs.
- `app/api/plan/route.ts`: bounded request validation and explicit live-access gate.
- `app/api/saved/route.ts`: browser-owned private collection, Prisma persistence, HttpOnly random token.
- `lib/auth.ts`, `app/api/auth/[...all]/route.ts`: Better Auth foundation; account creation disabled.
- `scripts/db-create.mjs`, `prisma/`: isolated local database setup and additive migration.
- `tests/domain.test.ts`: domain/provider contract tests, no live calls.
- `tests/qloo-client.test.ts`: transport destination, credential placement, error privacy and response bounds with mocked fetch only.
- `tests/api-smoke.ts`: actual local HTTP/database checks, writes a fictional fixture to its own test collection.

No model-driven agent loop is implemented. The app currently exposes a guided planning workflow with verified live Qloo results. Do not call it a completed agent competition entry until required agent behavior is verified. OpenAI Agents and AI SDK packages do not make calls. The issued Qloo key is in ignored local .env and live calls are enabled locally after official quota/expiry guidance and successful authentication were verified. A configured OpenAI key was detected; explicit reuse authorization remains pending under the credential skill. Do not call or wire OpenAI before that decision. No model secret was copied or printed.
