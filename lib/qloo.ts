import { z } from "zod"
import type { Candidate, PlanningRequest, PlanningResult } from "./domain"
import { createHackathonClient } from "./qloo-client"
export type ResolutionIssue = {
  input: string
  candidates: { id: string; name: string; type?: string }[]
}
export class QlooResolutionError extends Error {
  constructor(public issues: ResolutionIssue[]) {
    super(
      "Qloo could not resolve every interest. Choose the intended meaning or edit the interest."
    )
  }
}
const resolutionSchema = z.object({
  issues: z.array(
    z.object({
      input: z.string(),
      candidates: z
        .array(
          z.object({
            id: z.string(),
            name: z.string(),
            type: z.string().optional(),
          })
        )
        .optional(),
    })
  ),
})

// Shape verified against @qloo/qloo-harness 0.1.26 qloo-tools.js / compactEntity.
const entitySchema = z
  .object({
    entity_id: z.string(),
    name: z.string(),
    type: z.string().optional(),
    subtype: z.string().optional(),
    properties: z
      .object({
        description: z.string().optional(),
        short_description: z.string().optional(),
        address: z.unknown().optional(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough()
const envelopeSchema = z
  .object({
    status: z.string(),
    summary: z.string().optional(),
    results: z.array(entitySchema).optional(),
    interpretation: z.unknown().optional(),
    provenance: z
      .object({ source: z.string(), documentation: z.string() })
      .passthrough()
      .optional(),
  })
  .passthrough()

const liveCache = new Map<string, { until: number; result: PlanningResult }>()
let liveBusy = false
let nextCallAt = 0
export async function planLive(
  request: PlanningRequest
): Promise<PlanningResult> {
  // Names, date and budget never go to Qloo or enter the shared provider cache key.
  const key = JSON.stringify([
    request.city,
    request.participants.map((p) => p.interests),
    request.resolutions,
    request.excluded,
    request.revision,
  ])
  const cached = liveCache.get(key)
  if (cached && cached.until > Date.now())
    return { ...cached.result, request, createdAt: new Date().toISOString() }
  if (liveBusy || Date.now() < nextCallAt)
    throw new Error(
      "Live Qloo is busy. Wait a moment before preparing another plan."
    )
  liveBusy = true
  try {
    const result = await executeLive(request)
    if (liveCache.size >= 32) liveCache.delete(liveCache.keys().next().value!)
    // Keep only provider-derived results; never retain group nicknames in shared cache.
    const anonymous = {
      ...request,
      participants: request.participants.map((p) => ({
        ...p,
        name: "Guest",
        id: "guest",
      })),
    }
    liveCache.set(key, {
      until: Date.now() + 300_000,
      result: { ...result, request: anonymous },
    })
    return result
  } finally {
    liveBusy = false
    nextCallAt = Date.now() + 2_000
  }
}

async function executeLive(request: PlanningRequest): Promise<PlanningResult> {
  if (!process.env.QLOO_API_KEY)
    throw new Error(
      "Live Qloo is not configured. Sample mode is available separately."
    )
  const { createDirectQlooWorkflowExecutor } =
    await import("@qloo/qloo-harness")
  // Explicit client: no global config, default production endpoint or file logs.
  const executor = createDirectQlooWorkflowExecutor(
    createHackathonClient(process.env.QLOO_API_KEY),
    {}
  )
  const signals = [...new Set(request.participants.flatMap((p) => p.interests))]
  if (signals.length > 8)
    throw new Error(
      "Live Qloo supports up to eight distinct interests per plan. Remove a few and try again."
    )
  const tags = signals.map(
    (input) => request.resolutions?.find((r) => r.input === input)?.id ?? input
  )
  const execution = await executor.execute(
    "recommend",
    {
      target_type: "place",
      signal_tags: tags,
      signal_tags_operator: "union",
      filter_location: request.city,
      limit: 6,
      explain: true,
    },
    { signal: AbortSignal.timeout(45_000) }
  )
  return normalizeLiveResult(execution.result, request)
}

export function normalizeLiveResult(
  payload: unknown,
  request: PlanningRequest
): PlanningResult {
  const signals = [...new Set(request.participants.flatMap((p) => p.interests))]
  const parsedEnvelope = envelopeSchema.safeParse(payload)
  if (!parsedEnvelope.success)
    throw new Error(
      "Qloo did not return a valid result. Please try again later."
    )
  const envelope = parsedEnvelope.data
  if (envelope.status === "needs_input") {
    const parsed = resolutionSchema.safeParse(
      (payload as { resolution?: unknown }).resolution
    )
    throw new QlooResolutionError(
      parsed.success
        ? parsed.data.issues.map((i) => ({
            input: i.input,
            candidates: (i.candidates ?? [])
              .filter((c) => c.id.startsWith("urn:tag:"))
              .slice(0, 8),
          }))
        : []
    )
  }
  if (!["ok", "empty"].includes(envelope.status))
    throw new Error(
      "Qloo did not return a complete result. Please try again later."
    )
  if (!envelope.provenance || envelope.provenance.source !== "Qloo API")
    throw new Error(
      "Qloo did not return source provenance. Please try again later."
    )
  const candidates: Candidate[] = (envelope.results ?? [])
    .filter((e) => !request.excluded.includes(e.entity_id))
    .slice(0, 3)
    .map((e) => ({
      id: e.entity_id,
      name: e.name,
      kind: (e.subtype ?? e.type)?.replace(/^urn:entity:?/, "") || "Place",
      description:
        e.properties?.short_description ??
        e.properties?.description ??
        "Qloo returned this place for the combined cultural-interest query.",
      address:
        typeof e.properties?.address === "string" ? e.properties.address : null,
      source: "qloo",
      interests: [],
      quiet: null,
      price: null,
      note: "Returned for the combined group query. This does not establish any individual’s preference or verify venue conditions.",
      links: [
        {
          label: "Qloo source documentation",
          url: "https://docs.qloo.com/reference/insights-api-deep-dive",
        },
      ],
    }))
  return {
    mode: "live",
    candidates,
    request,
    interpretation: signals,
    createdAt: new Date().toISOString(),
    trace: [
      "Combined explicit interests without participant names",
      "Called Qloo recommend through the official server-side harness",
      "Applied explicit entity exclusions to the returned candidates",
      `Returned ${candidates.length} options; no purchases or reservations`,
    ],
    warnings: [
      "Qloo affinity reflects aggregate cultural relationships, not personal preference predictions.",
      "Budget, opening hours, noise and accessibility are unverified. Budget is a target, not a filter on live results.",
      "Location names are matched by Qloo. Use a precise city name and verify each address; no travel distance is calculated.",
      ...(request.revision === "quieter"
        ? [
            "Quietness cannot be verified by this provider. Check directly with the venue.",
          ]
        : []),
      ...(request.revision === "less-expensive"
        ? ["Live prices are unavailable; cheaper options cannot be verified."]
        : []),
    ],
  }
}
