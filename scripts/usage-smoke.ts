import "dotenv/config"
import { randomUUID } from "node:crypto"
import assert from "node:assert/strict"
import { db } from "../lib/db"
import { reserveUsage, DemoLimitError } from "../lib/usage"
const id = "test:concurrency:" + randomUUID()
const r = await Promise.allSettled(
  Array.from({ length: 12 }, () => reserveUsage([{ id, limit: 3 }]))
)
assert.equal(r.filter((x) => x.status === "fulfilled").length, 3)
assert.equal((await db.usageCounter.findUnique({ where: { id } }))?.count, 3)
assert.ok(
  r
    .filter((x) => x.status === "rejected")
    .every((x) => x.reason instanceof DemoLimitError)
)
const rollback = id + ":rollback"
await assert.rejects(
  reserveUsage([
    { id: rollback, limit: 2 },
    { id, limit: 3 },
  ]),
  DemoLimitError
)
assert.equal(
  await db.usageCounter.findUnique({ where: { id: rollback } }),
  null
)
console.log("PASS shared concurrent reservations and transaction rollback")
await db.$disconnect()
