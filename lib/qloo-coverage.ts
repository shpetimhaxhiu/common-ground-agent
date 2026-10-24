import type { QlooToolClient } from "@qloo/qloo-harness"
import { z } from "zod"
import { buildCoverage } from "./coverage"
import type { PlanningResult, PlanningRequest } from "./domain"
import { planLive } from "./qloo"
import { createHackathonClient } from "./qloo-client"
import { profileInterests } from "./cultural-seeds"

export async function compareSignals(
  base: PlanningResult,
  client: QlooToolClient,
  signal: AbortSignal
) {
  const profiles = base.request.participants.map((p, index) => ({
    index,
    interests: profileInterests(p),
    tags: p.interests,
    seeds: p.seeds ?? [],
  }))
  const scores: Map<string, number>[] = []
  for (const profile of profiles) {
    const tags = profile.tags.map(
      (input) => base.resolvedTags?.find((t) => t.input === input)?.id
    )
    if (tags.some((t) => !t))
      throw new Error(
        "Qloo did not confirm all interest signals for comparison."
      )
    const response = await client.insights(
      {
        "filter.type": "urn:entity:place",
        "filter.entities": base.candidates.map((c) => c.id),
        "filter.location.query": base.request.city,
        ...(tags.length
          ? {
              "signal.interests.tags": tags as string[],
              "operator.signal.interests.tags": "union",
            }
          : {}),
        ...(profile.seeds.length
          ? { "signal.interests.entities": profile.seeds.map((s) => s.id) }
          : {}),
        take: 3,
      },
      { signal }
    )
    const parsed = z
      .object({
        results: z.object({
          entities: z.array(
            z.object({
              entity_id: z.string(),
              query: z
                .object({ affinity: z.number().min(0).max(1) })
                .optional(),
              affinity: z.number().min(0).max(1).optional(),
            })
          ),
        }),
      })
      .safeParse(response)
    if (!parsed.success)
      throw new Error("Qloo did not return comparable affinity signals.")
    const map = new Map<string, number>()
    for (const entity of parsed.data.results.entities) {
      const score = entity.query?.affinity ?? entity.affinity
      if (
        score !== undefined &&
        base.candidates.some((c) => c.id === entity.entity_id)
      )
        map.set(entity.entity_id, score)
    }
    scores.push(map)
  }
  return buildCoverage(
    base.candidates.map((c) => c.id),
    profiles,
    scores
  )
}

export async function planCompared(
  request: PlanningRequest
): Promise<PlanningResult> {
  const base = await planLive(request)
  if (!base.candidates.length) return base
  const coverage = await compareSignals(
    base,
    createHackathonClient(process.env.QLOO_API_KEY!),
    AbortSignal.timeout(45_000)
  )
  return {
    ...base,
    coverage,
    trace: [
      ...base.trace,
      "Compared the same Qloo candidates against each explicit interest profile",
      "Ranked complete comparisons by their worst relative signal rank",
    ],
    warnings: [
      ...base.warnings,
      "Signal ranks compare only this shortlist. They are aggregate Qloo affinities, not a measure of personal satisfaction.",
    ],
  }
}
