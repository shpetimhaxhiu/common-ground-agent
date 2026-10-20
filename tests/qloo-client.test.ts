import test from "node:test"
import assert from "node:assert/strict"
import { createHackathonClient, HACKATHON_BASE_URL } from "../lib/qloo-client"

test("event transport sends credentials only to the fixed host, rejects redirects and constrains locality", async () => {
  const client = createHackathonClient("test-key", async (input, options) => {
    const url = new URL(String(input))
    assert.equal(url.origin, HACKATHON_BASE_URL)
    assert.equal(url.pathname, "/v2/insights")
    assert.equal(url.searchParams.get("filter.location.radius"), "0")
    assert.equal(url.searchParams.get("signal.interests.tags"), "a,b")
    assert.equal(url.searchParams.has("api_key"), false)
    assert.equal(options?.redirect, "error")
    assert.equal(new Headers(options?.headers).get("X-Api-Key"), "test-key")
    return Response.json({ success: true, results: { entities: [] } })
  })
  await client.insights({
    "signal.interests.tags": ["a", "b"],
    "filter.location.query": "New York City",
  })
})

test("upstream error bodies cannot enter user-facing errors", async () => {
  const client = createHackathonClient(
    "test-key",
    async () => new Response("private upstream diagnostics", { status: 401 })
  )
  await assert.rejects(client.tags({}), (error) => {
    assert(error instanceof Error)
    assert.match(error.message, /access was rejected/)
    assert.doesNotMatch(error.message, /diagnostics|test-key/)
    return true
  })
})

test("unexpected or oversized provider responses are rejected", async () => {
  const failed = createHackathonClient("test-key", async () =>
    Response.json({ success: false })
  )
  await assert.rejects(failed.tags({}), /successful response/)
  const oversized = createHackathonClient(
    "test-key",
    async () => new Response("x".repeat(2_000_001))
  )
  await assert.rejects(oversized.tags({}), /bounded response/)
})
