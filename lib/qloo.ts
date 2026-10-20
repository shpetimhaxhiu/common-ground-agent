import { z } from "zod"
import type { Candidate, PlanningRequest, PlanningResult } from "./domain"

// Shape verified against @qloo/qloo-harness 0.1.26 qloo-tools.js / compactEntity.
const entitySchema = z
  .object({
    entity_id: z.string(),
    name: z.string(),
    type: z.string().optional(),
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

export async function planLive(
  request: PlanningRequest
): Promise<PlanningResult> {
  if (!process.env.QLOO_API_KEY)
    throw new Error(
      "Live Qloo is not connected. The event API key is pending; sample mode is available separately."
    )
  const { createDirectQlooWorkflowExecutorFromEnvironment } =
    await import("@qloo/qloo-harness")
  // No implicit credential/config fallback to another account or provider.
  const executor = createDirectQlooWorkflowExecutorFromEnvironment({
    env: {
      QLOO_API_KEY: process.env.QLOO_API_KEY,
      NODE_ENV: process.env.NODE_ENV,
    },
    readConfigFile: () => '{"api_key":""}',
  })
  if (!executor) throw new Error("Live Qloo authentication is unavailable.")
  const signals = [...new Set(request.participants.flatMap((p) => p.interests))]
  const execution = await executor.execute(
    "recommend",
    {
      target_type: "place",
      signal_tags: signals,
      signal_tags_operator: "union",
      filter_location: request.city,
      limit: 12,
      explain: true,
    },
    { signal: AbortSignal.timeout(25_000) }
  )
  return normalizeLiveResult(execution.result, request)
}

export function normalizeLiveResult(
  payload: unknown,
  request: PlanningRequest
): PlanningResult {
  const signals = [...new Set(request.participants.flatMap((p) => p.interests))]
  const envelope = envelopeSchema.parse(payload)
  if (envelope.status === "needs_input")
    throw new Error(
      "Qloo could not resolve one or more interests or the location. Make the interests more specific and try again."
    )
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
      kind: e.type?.replace("urn:entity:", "") ?? "Place",
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
