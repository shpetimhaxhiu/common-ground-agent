import assert from "node:assert/strict"
import { initialRequest } from "../lib/domain"
const base = "http://127.0.0.1:3161"
const post = (path: string, body: unknown, origin = base) =>
  fetch(base + path, {
    method: "POST",
    headers: { "content-type": "application/json", origin },
    body: JSON.stringify(body),
  })
const response = await post("/api/plan", initialRequest)
assert.equal(response.status, 200)
const result = await response.json()
assert.equal(result.candidates[0].name, "Paper Moon")
console.log("PASS real plan API returns the sample shortlist")
assert.equal(
  (await post("/api/plan", { ...initialRequest, mode: "live" })).status,
  503
)
console.log("PASS live mode fails explicitly without sample fallback")
assert.equal(
  (await post("/api/plan", initialRequest, "https://untrusted.example")).status,
  403
)
console.log("PASS cross-origin planning requests rejected")
assert.equal(
  (await post("/api/plan", { ...initialRequest, date: "not-a-date" })).status,
  400
)
console.log("PASS invalid inputs rejected")
const save = await post("/api/saved", {
  result,
  candidate: result.candidates[0],
})
assert.equal(save.status, 201)
const cookie = save.headers.get("set-cookie")?.split(";")[0]
assert(cookie);
assert(cookie.startsWith("cg_collection="))
assert.match(save.headers.get("set-cookie") ?? "", /HttpOnly/i)
const own = await fetch(base + "/api/saved", { headers: { cookie } })
const collection = await own.json()
assert.equal(collection.plans.length, 1)
assert.equal(collection.plans[0].candidate.name, "Paper Moon")
console.log(
  "PASS PostgreSQL save/reopen round trip with HttpOnly ownership cookie"
)
const foreign = await fetch(base + "/api/saved")
assert.deepEqual((await foreign.json()).plans, [])
console.log("PASS another browser cannot read the saved collection")
assert.equal(
  (
    await post(
      "/api/saved",
      { result, candidate: result.candidates[0] },
      "https://untrusted.example"
    )
  ).status,
  403
)
console.log("PASS cross-origin saves rejected")
const session = await fetch(base + "/api/auth/get-session")
assert.equal(session.status, 200)
assert.equal(await session.json(), null)
console.log("PASS Better Auth session endpoint returns no fabricated login")
