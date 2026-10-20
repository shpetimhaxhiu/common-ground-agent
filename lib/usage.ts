import { createHmac } from "node:crypto"
import { db } from "./db"

export class DemoLimitError extends Error {}
// Every server instance shares these counters. Reservations are never refunded
// after failures: uncertainty cannot increase the approved public allowance.
export async function reserveUsage(entries: { id: string; limit: number }[]) {
  await db.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(74321851)`
    for (const entry of entries) {
      const current = await tx.usageCounter.findUnique({
        where: { id: entry.id },
      })
      if ((current?.count ?? 0) >= entry.limit)
        throw new DemoLimitError(
          "The shared demo allowance is reached. The fictional sample remains available; try live Qloo another day."
        )
      await tx.usageCounter.upsert({
        where: { id: entry.id },
        create: { id: entry.id, count: 1 },
        update: { count: { increment: 1 } },
      })
    }
  })
}
export async function reserveLiveRequest(request: Request) {
  const day = new Date().toISOString().slice(0, 10)
  const visitor = createHmac("sha256", process.env.BETTER_AUTH_SECRET!)
    .update(
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local"
    )
    .digest("hex")
  await reserveUsage([
    { id: `qloo:${day}`, limit: 100 },
    { id: `visitor:${day}:${visitor}`, limit: 8 },
  ])
}
export async function reserveAgentRun() {
  // 90 x $0.05 conservative reservations = $4.50 public allocation.
  // Leave $0.50 of the approved $5 for bounded release verification.
  await reserveUsage([{ id: "agent:approved-5usd-v1", limit: 90 }])
}
