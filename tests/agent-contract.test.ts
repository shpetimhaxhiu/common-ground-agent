import test from "node:test"
import assert from "node:assert/strict"
import { agentInput, validateAgentDecision } from "../lib/agent-contract"
import { initialRequest, sampleCandidates } from "../lib/domain"

test("model input keeps guest names, internal IDs and secret-bearing config out", () => {
  const request = {
    ...initialRequest,
    participants: initialRequest.participants.map((p) => ({
      ...p,
      name: `Private name ${p.id}`,
    })),
  }
  const input = JSON.stringify(agentInput(request, sampleCandidates))
  assert.doesNotMatch(input, /Private name|resolutions|API_KEY/)
  assert.match(input, /explicitInterests|budgetTargetEUR/)
})
const output = {
  summary: "Discuss these options.",
  selections: [
    {
      id: "paper-moon",
      reason: "A starting point.",
      tradeoff: "Check the details.",
    },
  ],
}
test("agent cannot select invented, excluded or uninspected identities", () => {
  const inspected = new Set(["paper-moon", "frame-table"])
  assert.doesNotThrow(() =>
    validateAgentDecision(output, sampleCandidates, inspected, true)
  )
  assert.throws(
    () =>
      validateAgentDecision(
        {
          ...output,
          selections: [{ ...output.selections[0], id: "invented" }],
        },
        sampleCandidates,
        inspected,
        true
      ),
    /unverified selection/
  )
  assert.throws(
    () =>
      validateAgentDecision(
        output,
        sampleCandidates.filter((c) => c.id !== "paper-moon"),
        inspected,
        true
      ),
    /unverified selection/
  )
  assert.throws(
    () =>
      validateAgentDecision(
        output,
        sampleCandidates,
        new Set(["frame-table", "margins"]),
        true
      ),
    /unverified selection/
  )
})
test("agent must inspect alternatives and review constraints; duplicate picks are rejected", () => {
  assert.throws(
    () =>
      validateAgentDecision(
        output,
        sampleCandidates,
        new Set(["paper-moon"]),
        true
      ),
    /evidence checks/
  )
  assert.throws(
    () =>
      validateAgentDecision(
        output,
        sampleCandidates,
        new Set(["paper-moon", "frame-table"]),
        false
      ),
    /evidence checks/
  )
  assert.throws(
    () =>
      validateAgentDecision(
        { ...output, selections: [...output.selections, ...output.selections] },
        sampleCandidates,
        new Set(["paper-moon", "frame-table"]),
        true
      ),
    /unverified selection/
  )
})
