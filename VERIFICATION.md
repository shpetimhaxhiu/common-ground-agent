# Verification — October 20, 2026

## Passed

- Next.js production build; TypeScript and ESLint checks.
- Eleven domain/provider normalization tests: whole-group sample overlap; budget and quieter constraints; exclusion/restoration; price ordering; different taste profile; empty results; bounded sample location; invalid inputs; honest text export; live unknowns; malformed/ambiguous/provenance-free responses; live ID exclusions.
- Eight local HTTP checks: real sample API response; live 503 with no fixture fallback; foreign-origin rejection; input validation; PostgreSQL save/reopen; another browser token sees no collection; cross-origin save rejection; Better Auth get-session returns null.
- Local database setup ran twice. Second run reused only the exact project database and applied no pending migrations. App role has no superuser privileges.
- Browser: build sample, quieter alternatives, select a plan, save, reload, reopen from saved collection, exclude Paper Moon, and inspect complete copyable plan text.
- Browser live mode shows an explicit access-pending error and creates no fabricated results.
- 1440-pixel layout visually inspected, no document overflow. 390-pixel geometry inspected, no document overflow; mobile layout also inspected at normal narrow browser size. Temporary viewport overrides reset before delivery.

## Limits

- No Qloo key is configured. One focused Gmail search found no API-key delivery message. API request receipt says a few business days.
- Provider adapter verified against installed harness 0.1.26 public exports, input schema and output normalization; live authentication, coverage, quotas, error semantics and real recommendation quality remain unverified.
- Live results preserve unknown budget, noise, availability and access; no per-person fit claims. Unsupported quieter/cheaper live refinements currently report limits rather than invent data.
- No model-driven agent loop or OpenAI API call. Guided workflow only; agent behavior remains a competition-readiness gate.
- Clipboard API reported success, but independent clipboard bytes could not be corroborated through browser automation. Complete copyable text was verified in the UI as a reliable fallback.
- Better Auth is configured with PostgreSQL, but account/password creation is disabled and no account UI is claimed.
- No public deployment, public repository, video upload or new final contest submission.
- Screenshot capture initially returned stale content from another tab. Those frames were not used as app proof. App-focused captures are saved under ignored `evidence/`.
