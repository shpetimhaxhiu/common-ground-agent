# Common Ground — a host for different tastes

Local review draft for the Qloo Agentic Hackathon. This document is not an entry receipt. Public source and hosting are approved; verified URLs will be added after release.

## One-line description

A group-outing planner that turns explicit interests into Qloo options, then uses an agent to inspect places and make the trade-offs discussable.

## The problem

Choosing an outing with friends often leaves one person doing the research and everyone else reacting to a long list. Common Ground starts with two to four people's explicit interests and presents a small shortlist for discussion. It does not claim to know what any person will like.

## What works today

- A separately labeled fictional Prishtina sample lets visitors explore the interaction without provider calls.
- Live mode uses the Qloo hackathon API through the official workflow harness. Ambiguous tag meanings require an explicit choice; unsupported interests stay unresolved.
- The OpenAI Agents SDK host inspects at least two Qloo candidate identities, reviews unknown constraints, and selects only inspected places. Its editorial suggestions are visibly distinct from provider facts.
- A group can exclude options, change direction, choose a plan and save it in a browser-owned private PostgreSQL collection. Saved agent reports survive reloads.
- Prices, opening hours, quietness, dietary suitability, access, availability and individual preference remain unverified. Nothing is booked or purchased.

## How it is built

Next.js App Router, React, shadcn/Radix, AI Elements Plan, Prisma/PostgreSQL and a Better Auth foundation with account creation disabled. Real Qloo recommendation calls use official harness 0.1.26 and a fixed event-only transport. The agent uses OpenAI Agents SDK 0.20.0 and gpt-6-luna with structured output, read-only function tools and server validation of selected IDs.

Guest names stay outside provider/model requests. API keys stay server-side. Agent tracing is disabled and Responses storage is disabled. Prompt and provider text are treated as untrusted data. API and model runs have bounded calls, output and duration; shared PostgreSQL reservations constrain public consumption across server instances.

## What was verified

Real Qloo access and quotas; agent-chosen Qloo entity lookups; constraint review; source-bound selections; browser clarification, live planning and save/reload/reopen; mobile and desktop report display. Twenty-two automated tests and eight HTTP/database checks cover current deterministic behavior. See VERIFICATION.md for run evidence and remaining limits. Live smoke data and screenshots are kept out of Git.

One verified agent run made five model calls, three Qloo entity lookups and one constraint review. It used 5,056 input tokens and 357 output tokens. It explicitly identified that the inspected descriptions did not establish a jazz offering. These counts describe that run, not every run.

## Challenges addressed

The event key needs the hackathon host rather than the production host. Interest words such as Coffee can refer to several tag meanings. Location names can match a state instead of a city. The implementation exposes ambiguity, supports precise city queries and uses Qloo's documented strict locality boundary rather than claiming arbitrary travel-distance precision.

## Remaining release work

Resolve the hosting project limit, publish approved source and demo, verify the public workflow; enter those URLs into Devpost and complete the required final human submission.

Public source: https://github.com/shpetimhaxhiu/common-ground-agent (MIT). Hosted demo URL is pending. No prize, user traction, submission or organizer acceptance is claimed.

## Why Qloo is central

The same shortlist is compared against each explicit interest profile using Qloo Insights. Common Ground shows raw affinity, within-profile relative rank, and a reproducible balance rule that minimizes the worst rank. This makes trade-offs inspectable instead of hiding them behind a generated explanation. The bounded agent must run that real comparison, inspect candidate identities and review unknown constraints before making an editorial suggestion. The Qloo-only comparison also works without a language model.
