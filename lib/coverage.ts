import { z } from "zod"
export const coverageSchema = z.object({
  profiles: z
    .array(
      z.object({ index: z.number().int(), interests: z.array(z.string()) })
    )
    .min(2)
    .max(4),
  rows: z
    .array(
      z.object({
        id: z.string(),
        affinities: z.array(z.number().min(0).max(1).nullable()),
        ranks: z.array(z.number().int().min(1).nullable()),
        worstRank: z.number().nullable(),
      })
    )
    .max(3),
  balancedIds: z.array(z.string()).max(3),
})
export type SignalCoverage = z.infer<typeof coverageSchema>

export function buildCoverage(
  ids: string[],
  profiles: SignalCoverage["profiles"],
  scores: Map<string, number>[]
): SignalCoverage {
  const rows = ids.map((id) => {
    const affinities = scores.map((s) => s.get(id) ?? null)
    const ranks = affinities.map((score, i) =>
      score === null
        ? null
        : 1 + [...scores[i].values()].filter((value) => value > score).length
    )
    return {
      id,
      affinities,
      ranks,
      worstRank: ranks.some((r) => r === null)
        ? null
        : Math.max(...(ranks as number[])),
    }
  })
  const balancedIds = rows
    .filter((r) => r.worstRank !== null)
    .sort(
      (a, b) =>
        a.worstRank! - b.worstRank! ||
        a.ranks.reduce<number>((s, r) => s + r!, 0) -
          b.ranks.reduce<number>((s, r) => s + r!, 0)
    )
    .map((r) => r.id)
  return { profiles, rows, balancedIds }
}
