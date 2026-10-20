# Verification — October 21, 2026

## Live integration update — October 21

- Issued event credential authenticated successfully at the exact official hackathon host. The first probe returned HTTP 200, 50,000/month and 10/second limits, with 49,999 monthly requests remaining immediately after that probe. No current-balance claim is made.
- Read the official event developer guide: keys remain active through judging; private server-side caching is allowed; provider response data must not be put in a public repository.
- Executed the official harness recommendation operation against the event API. An initial 25-second attempt timed out; a bounded 45-second attempt succeeded. The explicit transport now has no automatic retries and a fixed destination, redirect rejection, 150ms upstream spacing, ten-call budget and 2MB response cap.
- Chrome: live Jazz/Coffee query returned a clarification choice for Coffee. Selected the cuisine interpretation, generated three real provider options, selected one, saved it to PostgreSQL, reloaded and reopened the live plan from the same private collection.
- Found a geographic ambiguity: "New York" could match the state. Verified documented strict-boundary parameter, added filter.location.radius=0 and exercised "New York City". Returned city-specific options rather than silently claiming distance calculations.
- Preserved actual entity subtype in the UI. Live prices, quietness, personal fit, hours and availability remain unknown; no reservations or purchases occur.
- Sixteen automated domain/provider/transport tests pass. Eight current HTTP/database checks pass, including rejection of an invalid live request before quota use. The disabled-live 503 gate was exercised earlier in this run before locally enabling live mode.
- TypeScript, ESLint and final Next.js production build pass. Live saved-plan detail inspected at desktop width. 390px mobile page and dialog geometry showed no horizontal document overflow; normal desktop viewport restored. Private evidence: ignored evidence/qloo-live-saved-plan.jpg and evidence/qloo-live-mobile.jpg.
- Raw API probes and results remain only in ignored .runtime/. No key was printed, committed or captured in screenshots. No additional dependency was installed: the attempted separately published @qloo/client package returned 404, so the existing official harness is used with an explicit compatible transport.
- Model-driven agent work remains blocked on the required reuse/create credential decision. A configured OpenAI key was detected without revealing it. No model call, new public release or Qloo contest submission occurred.

The historical findings below describe the October 20 baseline and are superseded by this update where stated.

## October 20 baseline — passed

- Next.js production build; TypeScript and ESLint checks.
- Eleven domain/provider normalization tests: whole-group sample overlap; budget and quieter constraints; exclusion/restoration; price ordering; different taste profile; empty results; bounded sample location; invalid inputs; honest text export; live unknowns; malformed/ambiguous/provenance-free responses; live ID exclusions.
- Eight local HTTP checks: real sample API response; live 503 with no fixture fallback; foreign-origin rejection; input validation; PostgreSQL save/reopen; another browser token sees no collection; cross-origin save rejection; Better Auth get-session returns null.
- Local database setup ran twice. Second run reused only the exact project database and applied no pending migrations. App role has no superuser privileges.
- Browser: build sample, quieter alternatives, select a plan, save, reload, reopen from saved collection, exclude Paper Moon, and inspect complete copyable plan text.
- Browser live mode shows an explicit access-pending error and creates no fabricated results.
- 1440-pixel layout visually inspected, no document overflow. 390-pixel geometry inspected, no document overflow; mobile layout also inspected at normal narrow browser size. Temporary viewport overrides reset before delivery.

## October 20 baseline — limits

- No Qloo key is configured. One focused Gmail search found no API-key delivery message. API request receipt says a few business days.
- Provider adapter verified against installed harness 0.1.26 public exports, input schema and output normalization; live authentication, coverage, quotas, error semantics and real recommendation quality remain unverified.
- Live results preserve unknown budget, noise, availability and access; no per-person fit claims. Unsupported quieter/cheaper live refinements currently report limits rather than invent data.
- No model-driven agent loop or OpenAI API call. Guided workflow only; agent behavior remains a competition-readiness gate.
- Clipboard API reported success, but independent clipboard bytes could not be corroborated through browser automation. Complete copyable text was verified in the UI as a reliable fallback.
- Better Auth is configured with PostgreSQL, but account/password creation is disabled and no account UI is claimed.
- No public deployment, public repository, video upload or new final contest submission.
- Screenshot capture initially returned stale content from another tab. Those frames were not used as app proof. App-focused captures are saved under ignored `evidence/`.
