import test from "node:test"
import assert from "node:assert/strict"
import type { QlooToolClient } from "@qloo/qloo-harness"
import { requestSchema, initialRequest } from "../lib/domain"
import { parseCulturalRecords, verifyCulturalSeeds } from "../lib/qloo-seeds"
import { compareSignals } from "../lib/qloo-coverage"
import { normalizeLiveResult, planLive } from "../lib/qloo"
import { agentInput } from "../lib/agent-contract"

const artist = {
  id: "70CAE5BF-2F4C-445C-A3E5-4EDACFC3591C",
  name: "Radiohead",
  type: "artist" as const,
}
const movie = {
  id: "DF788007-B5EA-4F29-872B-96BCB8EEC42F",
  name: "The Grand Budapest Hotel",
  type: "movie" as const,
}
const request = {
  ...initialRequest,
  mode: "live" as const,
  participants: [
    { id: "a", name: "Private Name", interests: [], seeds: [artist] },
    { id: "b", name: "Other Name", interests: [], seeds: [movie] },
  ],
}
const payload = {
  results: {
    entities: [
      { entity_id: artist.id, name: artist.name, types: ["urn:entity:artist"] },
      { entity_id: movie.id, name: movie.name, types: ["urn:entity:movie"] },
    ],
  },
}

test("official workflow accepts entity-only input and sends actual cultural IDs to place insights", async () => {
  const originalFetch = globalThis.fetch
  const originalKey = process.env.QLOO_API_KEY
  process.env.QLOO_API_KEY = "offline-test-placeholder"
  let insightQuery: URL | undefined
  globalThis.fetch = async (input) => {
    const url = new URL(String(input))
    if (url.pathname === "/entities") {
      const ids = url.searchParams.get("entity_ids")!.split(",")
      return Response.json({
        results: {
          entities: payload.results.entities.filter((e) =>
            ids.includes(e.entity_id)
          ),
        },
      })
    }
    assert.equal(url.pathname, "/v2/insights")
    insightQuery = url
    return Response.json({
      results: {
        entities: [
          {
            entity_id: "50E6FD1D-FA14-4383-A7E9-FDEC343EDD8A",
            name: "Verified Place",
            types: ["urn:entity:place"],
          },
        ],
      },
    })
  }
  try {
    const result = await planLive(request)
    assert.equal(result.candidates[0].name, "Verified Place")
    assert.equal(result.resolvedSeeds?.length, 2)
    assert(
      insightQuery?.searchParams
        .get("signal.interests.entities")
        ?.includes(artist.id)
    )
    assert(!insightQuery?.searchParams.has("signal.interests.tags"))
  } finally {
    globalThis.fetch = originalFetch
    if (originalKey === undefined) delete process.env.QLOO_API_KEY
    else process.env.QLOO_API_KEY = originalKey
  }
})

test("entity-only profiles validate, empty profiles and malformed or excessive selections do not", () => {
  assert(requestSchema.safeParse(request).success)
  for (const seeds of [
    [],
    [{ ...artist, id: "untrusted" }],
    [{ ...artist, type: "place" }],
    Array(4).fill(artist),
  ]) {
    assert(
      !requestSchema.safeParse({
        ...request,
        participants: [
          { ...request.participants[0], seeds },
          request.participants[1],
        ],
      }).success
    )
  }
})
test("typed matches discard other entity types and expose bounded descriptions only", () => {
  const matches = parseCulturalRecords(payload, "artist")
  assert.equal(matches.length, 1)
  assert.equal(matches[0].name, "Radiohead")
  assert.equal(
    parseCulturalRecords({ results: payload.results.entities }, "artist")
      .length,
    1
  )
  assert(!("properties" in matches[0]))
})
test("verification replaces client labels with Qloo identities and rejects type mismatch or missing records", async () => {
  const client = { entities: async () => payload } as unknown as QlooToolClient
  assert.deepEqual(
    await verifyCulturalSeeds(
      client,
      [{ ...artist, name: "Forged title" }],
      AbortSignal.timeout(1000)
    ),
    [artist]
  )
  await assert.rejects(
    verifyCulturalSeeds(
      client,
      [{ ...artist, type: "book" }],
      AbortSignal.timeout(1000)
    )
  )
  await assert.rejects(
    verifyCulturalSeeds(
      {
        entities: async () => ({ results: { entities: [] } }),
      } as unknown as QlooToolClient,
      [artist],
      AbortSignal.timeout(1000)
    )
  )
})
test("entity-only comparisons use each profile's verified IDs and persist readable cultural evidence", async () => {
  const place = "50E6FD1D-FA14-4383-A7E9-FDEC343EDD8A"
  const base = normalizeLiveResult(
    {
      status: "ok",
      provenance: {
        source: "Qloo API",
        documentation: "https://docs.qloo.com",
      },
      interpretation: { signal_tags: [] },
      results: [{ entity_id: place, name: "Qloo Place" }],
    },
    request
  )
  const queries: Record<string, unknown>[] = []
  const client = {
    insights: async (query: Record<string, unknown>) => {
      queries.push(query)
      return {
        results: { entities: [{ entity_id: place, query: { affinity: 0.7 } }] },
      }
    },
  } as unknown as QlooToolClient
  const coverage = await compareSignals(base, client, AbortSignal.timeout(1000))
  assert.deepEqual(
    queries.map((q) => q["signal.interests.entities"]),
    [[artist.id], [movie.id]]
  )
  assert(queries.every((q) => !("signal.interests.tags" in q)))
  assert.equal(base.resolvedSeeds?.length, 2)
  assert.deepEqual(coverage.profiles[0].interests, ["Artist: Radiohead"])
  assert(base.interpretation.includes("Film: The Grand Budapest Hotel"))
  const context = JSON.stringify(agentInput(request, base.candidates))
  assert(context.includes("Artist: Radiohead"))
  assert(!context.includes("Private Name"))
})
