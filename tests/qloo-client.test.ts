import test from "node:test"
import assert from "node:assert/strict"
import {
  createHackathonClient,
  HACKATHON_BASE_URL,
  QlooTransportError,
} from "../lib/qloo-client"

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

test("a provider disconnect after headers stays a safe transport error", async () => {
  let calls = 0
  const client = createHackathonClient("private-test-key", async () => {
    calls++
    return new Response(
      new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('{"success":'))
          controller.error(
            new Error("private upstream address and credentials")
          )
        },
      })
    )
  })
  await assert.rejects(client.tags({}), (error) => {
    assert(error instanceof QlooTransportError)
    assert.match(error.message, /response was interrupted/)
    assert.doesNotMatch(error.message, /private|credentials|address/)
    return true
  })
  assert.equal(calls, 2, "read-only retries are bounded to one")
})

test("an interrupted response can recover inside the original call budget", async () => {
  let calls = 0
  const signals: (AbortSignal | null | undefined)[] = []
  const client = createHackathonClient("test-key", async (_url, options) => {
    calls++
    signals.push(options?.signal)
    if (calls === 1)
      return new Response(
        new ReadableStream({
          start(controller) {
            controller.error(new Error("socket closed"))
          },
        })
      )
    return Response.json({ success: true, results: { entities: [] } })
  })
  await client.tags({})
  assert.equal(calls, 2)
  assert.equal(signals[0], signals[1], "retry must not reset the deadline")
})

test("retries never exceed ten upstream calls or retry auth/rate-limit failures", async () => {
  let calls = 0
  const flaky = createHackathonClient("test-key", async () => {
    calls++
    return new Response(null, { status: 503 })
  })
  for (let i = 0; i < 5; i++) await assert.rejects(flaky.tags({}))
  await assert.rejects(flaky.tags({}), /request budget reached/)
  assert.equal(calls, 10)
  for (const status of [400, 401, 403, 429]) {
    let rejectedCalls = 0
    const rejected = createHackathonClient("test-key", async () => {
      rejectedCalls++
      return new Response(null, { status })
    })
    await assert.rejects(rejected.tags({}))
    assert.equal(rejectedCalls, 1)
  }
})

test("a response-body timeout is classified without leaking upstream errors", async () => {
  const controller = new AbortController()
  const client = createHackathonClient(
    "private-test-key",
    async () =>
      new Response(
        new ReadableStream({
          pull(stream) {
            controller.abort()
            stream.error(new Error("private timeout diagnostics"))
          },
        })
      )
  )
  await assert.rejects(
    client.tags({}, { signal: controller.signal }),
    (error) => {
      assert(error instanceof QlooTransportError)
      assert.match(error.message, /took too long/)
      assert.doesNotMatch(error.message, /private|diagnostics/)
      return true
    }
  )
})
