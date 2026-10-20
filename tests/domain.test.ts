import { test } from "node:test"
import assert from "node:assert/strict"
import {
  initialRequest,
  makePlanText,
  planSample,
  requestSchema,
  sampleSupport,
} from "../lib/domain"

test("balanced sample prioritizes an option with something for every participant", () => {
  const result = planSample(initialRequest)
  assert.equal(result.candidates.length, 3)
  assert(
    initialRequest.participants.every(
      (p) => sampleSupport(result.candidates[0], p).length > 0
    )
  )
  assert(result.warnings.some((w) => w.includes("fictional")))
})
test("budget and quietness are real constraints in the fictional model", () => {
  const result = planSample({
    ...initialRequest,
    budget: 15,
    revision: "quieter",
  })
  assert(result.candidates.length > 0)
  assert(
    result.candidates.every((c) => c.quiet && c.price !== null && c.price <= 15)
  )
  assert(!result.candidates.some((c) => c.id === "frame-table"))
})
test("exclusions survive direction changes; restoring a stop makes it eligible again", () => {
  const excluded = initialRequest.excluded.concat("paper-moon")
  for (const revision of [
    "balanced",
    "quieter",
    "less-expensive",
    "surprise",
  ] as const)
    assert(
      !planSample({ ...initialRequest, excluded, revision }).candidates.some(
        (c) => c.id === "paper-moon"
      )
    )
  assert(
    planSample(initialRequest).candidates.some((c) => c.id === "paper-moon")
  )
})
test("cheaper direction sorts by fictional price and no eligible results stays empty", () => {
  const result = planSample({ ...initialRequest, revision: "less-expensive" })
  assert.deepEqual(
    result.candidates.map((c) => c.price),
    [10, 12, 14]
  )
  assert.equal(
    planSample({ ...initialRequest, budget: 0 }).candidates.length,
    0
  )
})
test("a different interest profile changes the shortlist", () => {
  const result = planSample({
    ...initialRequest,
    participants: initialRequest.participants
      .slice(0, 2)
      .map((p) => ({ ...p, interests: ["Vegetarian food"] })),
  })
  assert.equal(result.candidates[0].id, "green-note")
})
test("sample location is bounded rather than pretending worldwide venue coverage", () => {
  assert.throws(
    () => planSample({ ...initialRequest, city: "Paris" }),
    /fictional sample/
  )
})
test("invalid dates, single-person groups and empty interests are rejected", () => {
  assert(
    !requestSchema.safeParse({ ...initialRequest, date: "2026-02-31" }).success
  )
  assert(
    !requestSchema.safeParse({
      ...initialRequest,
      participants: initialRequest.participants.slice(0, 1),
    }).success
  )
  assert(
    !requestSchema.safeParse({
      ...initialRequest,
      participants: initialRequest.participants.map((p) => ({
        ...p,
        interests: [],
      })),
    }).success
  )
})
test("copyable plan carries sample disclosure and unresolved real-world checks", () => {
  const result = planSample(initialRequest)
  const text = makePlanText(result, result.candidates[0])
  assert.match(text, /FICTIONAL SAMPLE/)
  assert.match(text, /No booking has been made/)
  assert.match(text, /opening hours, current prices/)
})

test("live provider normalization keeps unknown costs and conditions unknown", async () => {
  const { normalizeLiveResult } = await import("../lib/qloo")
  const result = normalizeLiveResult(
    {
      status: "ok",
      provenance: {
        source: "Qloo API",
        documentation: "https://docs.qloo.com/reference/insights-api-deep-dive",
      },
      results: [
        {
          entity_id: "real-id",
          name: "Provider option",
          properties: { price_level: 2 },
        },
      ],
    },
    { ...initialRequest, mode: "live" }
  )
  assert.equal(result.mode, "live")
  assert.equal(result.candidates[0].source, "qloo")
  assert.equal(result.candidates[0].price, null)
  assert.equal(result.candidates[0].quiet, null)
  assert.deepEqual(result.candidates[0].interests, [])
})
test("ambiguous, malformed and unproven live output never becomes a sample", async () => {
  const { normalizeLiveResult } = await import("../lib/qloo")
  assert.throws(
    () =>
      normalizeLiveResult(
        { status: "needs_input", results: [] },
        initialRequest
      ),
    /could not resolve/
  )
  assert.throws(() =>
    normalizeLiveResult(
      { status: "ok", results: [{ name: "Missing identity" }] },
      initialRequest
    )
  )
  assert.throws(
    () => normalizeLiveResult({ status: "ok", results: [] }, initialRequest),
    /source provenance/
  )
})
test("live entity exclusions are applied without renaming or inventing replacements", async () => {
  const { normalizeLiveResult } = await import("../lib/qloo")
  const result = normalizeLiveResult(
    {
      status: "ok",
      provenance: {
        source: "Qloo API",
        documentation: "https://docs.qloo.com/reference/insights-api-deep-dive",
      },
      results: [
        { entity_id: "excluded", name: "Exclude me" },
        { entity_id: "remain", name: "Keep me" },
      ],
    },
    { ...initialRequest, mode: "live", excluded: ["excluded"] }
  )
  assert.deepEqual(
    result.candidates.map((c) => c.id),
    ["remain"]
  )
})

test("ambiguous provider tags surface bounded choices rather than guessing", async () => {
  const { normalizeLiveResult, QlooResolutionError } =
    await import("../lib/qloo")
  assert.throws(
    () =>
      normalizeLiveResult(
        {
          status: "needs_input",
          resolution: {
            issues: [
              {
                input: "Coffee",
                candidates: [
                  {
                    id: "urn:tag:cuisine:qloo:coffee",
                    name: "Coffee",
                    type: "urn:tag:cuisine:qloo",
                  },
                  { id: "not-a-tag", name: "Wrong type" },
                ],
              },
            ],
          },
        },
        initialRequest
      ),
    (error: unknown) => {
      assert(error instanceof QlooResolutionError)
      assert.equal(error.issues[0].input, "Coffee")
      assert.equal(error.issues[0].candidates.length, 1)
      return true
    }
  )
})

test("explicit tag choices are bounded and cannot inject arbitrary request destinations", () => {
  assert(
    requestSchema.safeParse({
      ...initialRequest,
      resolutions: [
        { input: "Coffee", id: "urn:tag:cuisine:qloo:coffee", name: "Coffee" },
      ],
    }).success
  )
  assert(
    !requestSchema.safeParse({
      ...initialRequest,
      resolutions: [
        { input: "Coffee", id: "https://example.org", name: "Coffee" },
      ],
    }).success
  )
})
