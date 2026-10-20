import { z } from "zod"
import type { Candidate, PlanningRequest } from "./domain"

export const agentDecisionSchema = z.object({
  summary: z.string().min(1).max(600),
  selections: z
    .array(
      z.object({
        id: z.string().min(1).max(150),
        reason: z.string().min(1).max(300),
        tradeoff: z.string().min(1).max(300),
      })
    )
    .min(1)
    .max(3),
})
export const agentReportSchema = agentDecisionSchema.extend({
  model: z.string().max(100),
  activity: z
    .array(z.object({ tool: z.string().max(80), detail: z.string().max(200) }))
    .max(6),
  modelCalls: z.number().int().min(1).max(6),
  inputTokens: z.number().int().min(0),
  outputTokens: z.number().int().min(0),
})
export type AgentReport = z.infer<typeof agentReportSchema>

export function agentInput(request: PlanningRequest, candidates: Candidate[]) {
  return {
    city: request.city,
    occasion: {
      date: request.date,
      time: request.time,
      budgetTargetEUR: request.budget,
      direction: request.revision,
    },
    guests: request.participants.map((p, index) => ({
      guest: index + 1,
      explicitInterests: p.interests,
    })),
    options: candidates.map((c) => ({
      id: c.id,
      name: c.name.slice(0, 200),
      providerDescription: c.description.slice(0, 1200),
      address: c.address?.slice(0, 300) ?? null,
    })),
    unknown: [
      "individual preference",
      "current price",
      "opening hours",
      "noise",
      "dietary suitability",
      "accessibility",
      "availability",
      "travel distance",
    ],
  }
}

export function validateAgentDecision(
  output: unknown,
  candidates: Candidate[],
  inspected: Set<string>,
  constraintsReviewed: boolean
) {
  const parsed = agentDecisionSchema.safeParse(output)
  if (!parsed.success)
    throw new Error(
      "The planning agent returned an invalid shortlist. Try again later."
    )
  const result = parsed.data
  const ids = result.selections.map((s) => s.id)
  if (!constraintsReviewed || inspected.size < Math.min(2, candidates.length))
    throw new Error(
      "The planning agent did not finish its evidence checks. Try again later."
    )
  if (
    new Set(ids).size !== ids.length ||
    ids.some((id) => !inspected.has(id) || !candidates.some((c) => c.id === id))
  )
    throw new Error(
      "The planning agent returned an unverified selection. Try again later."
    )
  return result
}
