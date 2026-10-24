import test from "node:test"
import assert from "node:assert/strict"
import { initialRequest } from "../lib/domain"

test("an unavailable allowance database fails closed before provider calls", async (t) => {
  const previous = {
    enabled: process.env.ENABLE_LIVE_QLOO,
    origin: process.env.BETTER_AUTH_URL,
  }
  process.env.ENABLE_LIVE_QLOO = "true"
  process.env.BETTER_AUTH_URL = "http://localhost:3161"
  t.after(() => {
    if (previous.enabled === undefined) delete process.env.ENABLE_LIVE_QLOO
    else process.env.ENABLE_LIVE_QLOO = previous.enabled
    if (previous.origin === undefined) delete process.env.BETTER_AUTH_URL
    else process.env.BETTER_AUTH_URL = previous.origin
  })
  const { db } = await import("../lib/db")
  const { POST } = await import("../app/api/plan/route")
  const originalTransaction = db.$transaction
  db.$transaction = async () => {
    throw new Error("private database connection details")
  }
  t.after(() => {
    db.$transaction = originalTransaction
  })
  const provider = t.mock.method(globalThis, "fetch", async () => {
    throw new Error("provider must not be called")
  })
  const logger = t.mock.method(console, "error", () => {})
  const response = await POST(
    new Request("http://localhost:3161/api/plan", {
      method: "POST",
      headers: {
        Origin: "http://localhost:3161",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...initialRequest,
        mode: "live",
        assistance: "compare",
      }),
    })
  )
  assert.equal(response.status, 503)
  const body = await response.json()
  assert.match(body.error, /allowance could not be checked/)
  assert.doesNotMatch(JSON.stringify(body), /private|database connection/)
  assert.equal(provider.mock.callCount(), 0)
  assert.equal(logger.mock.callCount(), 1)
  assert.deepEqual(Object.keys(logger.mock.calls[0].arguments[1]).sort(), [
    "elapsedMs",
    "stage",
  ])
  assert.equal(logger.mock.calls[0].arguments[1].stage, "allowance")
})
