# Common Ground — a host for different tastes

Prepared story for the Qloo Agentic Hackathon, with verified submission status below. Public source and hosted app are published. The Devpost story may differ from this updated source document.

## One-line description

A group-outing planner that turns explicit interests into Qloo options, then uses an agent to inspect places and make the trade-offs discussable.

## The problem

Choosing an outing with friends often leaves one person doing the research and everyone else reacting to a long list. Common Ground starts with two to four people's explicit interests and presents a small shortlist for discussion. It does not claim to know what any person will like.

## What works today

- A separately labeled fictional Prishtina sample lets visitors explore the interaction without provider calls.
- Live mode uses the Qloo hackathon API through the official workflow harness. Ambiguous tag meanings require an explicit choice; unsupported interests stay unresolved.
- Each person can search and select real artists, films and books. Qloo identities and types are verified before their entity IDs ground both place retrieval and separate per-person affinity queries. In a live New York test, Radiohead and a film/book profile ranked the same three places differently; the balance rule chose Brooklyn Bridge between their competing first choices, Little Italy and Top of the Rock. This demonstrates aggregate cultural relationships, not predicted individual satisfaction.
- The OpenAI Agents SDK host inspects at least two Qloo candidate identities, reviews unknown constraints, and selects only inspected places. Its editorial suggestions are visibly distinct from provider facts.
- A group can exclude options, change direction, choose a plan and save it in a browser-owned private PostgreSQL collection. Saved agent reports survive reloads.
- Prices, opening hours, quietness, dietary suitability, access, availability and individual preference remain unverified. Nothing is booked or purchased.

## How it is built

Next.js App Router, React, shadcn/Radix, AI Elements Plan, Prisma/PostgreSQL and a Better Auth foundation with account creation disabled. Real Qloo recommendation calls use official harness 0.1.26 and a fixed event-only transport. The agent uses OpenAI Agents SDK 0.20.0 and gpt-6-luna with structured output, read-only function tools and server validation of selected IDs.

Guest names stay outside provider/model requests. API keys stay server-side. Agent tracing is disabled and Responses storage is disabled. Prompt and provider text are treated as untrusted data. API and model runs have bounded calls, output and duration; shared PostgreSQL reservations constrain public consumption across server instances.

## What was verified

Real Qloo access and quotas; artist/film/book search and identity verification; agent-chosen Qloo entity lookups; constraint review; source-bound selections; browser clarification, live planning and save/reload/reopen; mobile and desktop report display. Thirty-five automated tests and nine HTTP/database checks cover current deterministic behavior. See VERIFICATION.md for run evidence and remaining limits. Live smoke data and screenshots are kept out of Git.

One verified agent run made five model calls, three Qloo entity lookups and one constraint review. It used 5,056 input tokens and 357 output tokens. It explicitly identified that the inspected descriptions did not establish a jazz offering. These counts describe that run, not every run.

## Challenges addressed

The event key needs the hackathon host rather than the production host. Interest words such as Coffee can refer to several tag meanings. Location names can match a state instead of a city. The implementation exposes ambiguity, supports precise city queries and uses Qloo's documented strict locality boundary rather than claiming arbitrary travel-distance precision.

## Remaining release work

Devpost registration and final human submission are complete. On October 24, authenticated Chrome showed the explicit "Project submitted!" confirmation and "SUBMITTED TO Qloo Agentic Hackathon" section. The entry includes its name, pitch, story, technology tags, public demo and source links, project start date, thumbnail and two gallery screenshots. Published entry: https://devpost.com/software/common-ground-xauf3m . No judging acceptance, ranking or prize is claimed. Edits remain possible until October 30, 2026 at 11:45pm EDT (October 31 at 04:45 Europe/Budapest).

October 24 recheck: the public home page loads. The first fresh live comparison returned a generic planning-provider unavailable error; a deliberate retry succeeded with Da Capo, Lyceum Theatre and Island, including the real affinity/rank matrix. The transient failure's cause remains unresolved. Authentic home-screen and live-matrix screenshots were captured for the entry gallery. This check did not rerun the model agent or the complete release suite.

Public source: https://github.com/shpetimhaxhiu/common-ground-agent (MIT). Hosted demo: https://common-ground-agent.vercel.app . No prize, user traction, submission or organizer acceptance is claimed.

## Why Qloo is central

The same shortlist is compared against each explicit interest profile using Qloo Insights. Common Ground shows raw affinity, within-profile relative rank, and a reproducible balance rule that minimizes the worst rank. This makes trade-offs inspectable instead of hiding them behind a generated explanation. The bounded agent must run that real comparison, inspect candidate identities and review unknown constraints before making an editorial suggestion. The Qloo-only comparison also works without a language model.

## Judge testing instructions

1. Open https://common-ground-agent.vercel.app without signing in.
2. Choose Try a real comparison, then Find common ground. Jazz/Coffee are illustrative inputs; the places and affinity signals come from Qloo.
3. Inspect the relative-rank matrix and balanced starting point. Choose Agent · inspect and compare to see the completed Qloo lookups and constraint review.
4. Choose Make this the plan, save it, refresh and reopen it from Saved plans. Collections are private to each browser.
5. Edit interests or exclude an option; clarify ambiguous meanings when asked. Prices, hours, access, quietness, diets and availability remain unknown, and nothing is booked.

Public application is verified in Chrome and by eight anonymous HTTP/database checks. No video is required by the current event rules. The app is on existing/free hosting with a finite, shared model allowance; Qloo-only comparison does not use model tokens.
