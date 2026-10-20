<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->


# Common Ground project instructions

Read `.agent-docs/index.md` first. Keep the fictional sample visibly labeled and separate from live Qloo. Never convert affinity into a personal preference prediction or claim unknown real-world price/access/noise details. No silent provider or credential fallback. No public release until live behavior is demonstrated and publication approved. Final prize entry requires user handoff.

Use pnpm. Run `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm build`; run `pnpm exec tsx tests/api-smoke.ts` against local port 3161 after API/database changes. Never reset the database. Preserve the exact project-local target and all user collections. Keep secrets out of docs, logs and Git. No automated live API calls before event quota and credentials are verified.
