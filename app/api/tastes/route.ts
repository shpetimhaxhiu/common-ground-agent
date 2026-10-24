import { z } from "zod"
import { culturalTypeSchema } from "@/lib/cultural-seeds"
import { createHackathonClient, QlooTransportError } from "@/lib/qloo-client"
import { parseCulturalRecords } from "@/lib/qloo-seeds"
import { DemoLimitError, reserveLiveRequest } from "@/lib/usage"

export const runtime = "nodejs"
export const maxDuration = 60
const inputSchema = z.object({
  query: z.string().trim().min(2).max(100),
  type: culturalTypeSchema,
})
const cache = new Map<
  string,
  { until: number; records: ReturnType<typeof parseCulturalRecords> }
>()
export async function POST(request: Request) {
  const headers = { "Cache-Control": "no-store" }
  if (
    request.headers.get("origin") !==
    new URL(process.env.BETTER_AUTH_URL ?? request.url).origin
  )
    return Response.json(
      { error: "This request must come from the app." },
      { status: 403, headers }
    )
  if (Number(request.headers.get("content-length") ?? 0) > 1000)
    return Response.json(
      { error: "Request is too large." },
      { status: 413, headers }
    )
  try {
    const text = await request.text()
    if (Buffer.byteLength(text) > 1000)
      return Response.json(
        { error: "Request is too large." },
        { status: 413, headers }
      )
    const input = inputSchema.safeParse(JSON.parse(text))
    if (!input.success)
      return Response.json(
        {
          error:
            "Enter at least two characters and choose Artist, Film or Book.",
        },
        { status: 400, headers }
      )
    const { query, type } = input.data
    if (process.env.ENABLE_LIVE_QLOO !== "true" || !process.env.QLOO_API_KEY)
      return Response.json(
        { error: "Live Qloo search is unavailable." },
        { status: 503, headers }
      )
    await reserveLiveRequest(request, "taste-search")
    const key = JSON.stringify([type, query.toLowerCase()])
    let entry = cache.get(key)
    if (!entry || entry.until <= Date.now()) {
      const payload = await createHackathonClient(
        process.env.QLOO_API_KEY
      ).searchEntities(
        { query, types: `urn:entity:${type}`, take: 5 },
        { signal: AbortSignal.timeout(30_000) }
      )
      entry = {
        until: Date.now() + 300_000,
        records: parseCulturalRecords(payload, type).slice(0, 5),
      }
      if (cache.size >= 32) cache.delete(cache.keys().next().value!)
      cache.set(key, entry)
    }
    return Response.json(
      { records: entry.records, source: "Qloo API" },
      { headers }
    )
  } catch (error) {
    const status =
      error instanceof DemoLimitError
        ? 429
        : error instanceof SyntaxError
          ? 400
          : error instanceof QlooTransportError
            ? error.status
            : 503
    return Response.json(
      {
        error:
          status === 400
            ? "Enter at least two characters and choose Artist, Film or Book."
            : status === 429
              ? "The shared search allowance is reached. Try again later."
              : "Qloo search could not complete. Your selections are preserved; try again later.",
      },
      { status, headers }
    )
  }
}
