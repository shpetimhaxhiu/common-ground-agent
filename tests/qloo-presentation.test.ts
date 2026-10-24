import test from "node:test"
import assert from "node:assert/strict"
import { buildCoverage } from "../lib/coverage"
import { profileSignalSummary, liveExample } from "../lib/qloo-presentation"
import { requestSchema } from "../lib/domain"

test("equal returned affinities are presented as ties, not strong matches", () => {
  const coverage = buildCoverage(
    ["a", "b"],
    [
      { index: 0, interests: ["Jazz"] },
      { index: 1, interests: ["Coffee"] },
    ],
    [
      new Map([
        ["a", 0.5],
        ["b", 0.5],
      ]),
      new Map([
        ["a", 0.99],
        ["b", 0.5],
      ]),
    ]
  )
  assert.match(profileSignalSummary(coverage, 0), /tied/)
  assert.doesNotMatch(
    profileSignalSummary(coverage, 0),
    /strong|confidence|perfect|compatible/
  )
  assert.match(profileSignalSummary(coverage, 1), /2 relative ranks/)
})

test("missing profile scores cannot become a tie claim", () => {
  const coverage = buildCoverage(
    ["a", "b"],
    [
      { index: 0, interests: ["Jazz"] },
      { index: 1, interests: ["Coffee"] },
    ],
    [new Map(), new Map([["a", 0.5]])]
  )
  assert.match(profileSignalSummary(coverage, 0), /Not enough/)
  assert.match(profileSignalSummary(coverage, 1), /Not enough/)
  assert.match(profileSignalSummary(coverage, 9), /Not enough/)
})

test("the live example selects real Qloo comparison without automatic model use", () => {
  const example = liveExample("2026-11-03")
  assert.equal(requestSchema.safeParse(example).success, true)
  assert.equal(example.mode, "live")
  assert.equal(example.assistance, "compare")
  assert.equal(example.date, "2026-11-03")
  assert.equal(example.city, "New York City")
  assert.equal(example.participants.length, 2)
  assert.equal(example.resolutions?.[0].id, "urn:tag:cuisine:qloo:coffee")
})
