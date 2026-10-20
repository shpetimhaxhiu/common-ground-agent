# Common Ground navigation

- `README.md`: run commands, verification, publication gates.
- `lib/domain.ts`: request validation, fictional sample model, shortlist ranking, text export.
- `lib/qloo.ts`: official harness adapter, strict source normalization, no credential fallback.
- `components/planning-workspace.tsx`: complete interactive workspace and accessible Radix dialogs.
- `app/api/plan/route.ts`: bounded request validation and explicit live-access gate.
- `app/api/saved/route.ts`: browser-owned private collection, Prisma persistence, HttpOnly random token.
- `lib/auth.ts`, `app/api/auth/[...all]/route.ts`: Better Auth foundation; account creation disabled.
- `scripts/db-create.mjs`, `prisma/`: isolated local database setup and additive migration.
- `tests/domain.test.ts`: domain/provider contract tests, no live calls.
- `tests/api-smoke.ts`: actual local HTTP/database checks, writes a fictional fixture to its own test collection.

No model-driven agent loop is implemented. The app currently exposes a guided planning workflow. Do not call it a completed agent competition entry until real Qloo use and the required agent behavior have been verified. OpenAI Agents and AI SDK packages are installed for later integration but do not make calls. No API credentials have been configured.
