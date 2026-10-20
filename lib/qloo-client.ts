import type { QlooToolClient } from "@qloo/qloo-harness"

export const HACKATHON_BASE_URL = "https://hackathon.api.qloo.com"
export class QlooTransportError extends Error {
  constructor(
    message: string,
    public status = 502
  ) {
    super(message)
  }
}
type Query = Parameters<QlooToolClient["insights"]>[0]
type Options = Parameters<QlooToolClient["insights"]>[1]

// Transport for the official workflow harness. The event endpoint is fixed and
// redirects are rejected so credentials cannot move to a different destination.
export function createHackathonClient(
  apiKey: string,
  fetcher: typeof fetch = fetch
): QlooToolClient {
  let calls = 0
  let nextStart = 0
  async function get(path: string, query: Query, options?: Options) {
    if (++calls > 10)
      throw new QlooTransportError(
        "Live Qloo request budget reached. Simplify the interests and try again."
      )
    const wait = Math.max(0, nextStart - Date.now())
    nextStart = Math.max(nextStart, Date.now()) + 150
    if (wait) await new Promise((resolve) => setTimeout(resolve, wait))
    const url = new URL(path, HACKATHON_BASE_URL)
    for (const [key, value] of Object.entries(query)) {
      if (value !== null && value !== undefined)
        url.searchParams.set(
          key,
          Array.isArray(value) ? value.join(",") : String(value)
        )
    }
    const response = await fetcher(url, {
      headers: { "X-Api-Key": apiKey, Accept: "application/json" },
      signal: options?.signal ?? AbortSignal.timeout(45_000),
      redirect: "error",
      cache: "no-store",
    }).catch(() => {
      throw new QlooTransportError(
        options?.signal?.aborted
          ? "Live Qloo took too long. Your inputs are preserved; try again later."
          : "Live Qloo could not be reached. Your inputs are preserved; try again later."
      )
    })
    if (!response.ok) {
      const messages: Record<number, string> = {
        400: "Qloo could not match the location or interests. Use a precise city name and check the selected meanings.",
        401: "Live Qloo access was rejected. Check the server credentials and event access period.",
        403: "Live Qloo access does not permit this request.",
        429: "Live Qloo has reached a usage limit. Wait before trying again.",
      }
      await response.body?.cancel()
      throw new QlooTransportError(
        messages[response.status] ??
          "Qloo did not complete the request. Try again later.",
        response.status === 429 ? 429 : response.status === 400 ? 400 : 502
      )
    }
    const reader = response.body?.getReader()
    if (!reader)
      throw new QlooTransportError("Qloo did not return a response body.")
    const chunks: Uint8Array[] = []
    let bytes = 0
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        bytes += value.byteLength
        if (bytes > 2_000_000)
          throw new QlooTransportError(
            "Qloo did not return a bounded response."
          )
        chunks.push(value)
      }
    } finally {
      await reader.cancel()
    }
    let data
    try {
      data = JSON.parse(Buffer.concat(chunks).toString("utf8"))
    } catch {
      throw new QlooTransportError("Qloo did not return valid JSON.")
    }
    if (!data || typeof data !== "object" || data.success === false)
      throw new QlooTransportError("Qloo did not return a successful response.")
    return data
  }
  return {
    insights: (query, options) =>
      get("/v2/insights", { ...query, "filter.location.radius": 0 }, options),
    searchEntities: (query, options) => get("/search", query, options),
    entities: (ids, options) => get("/entities", { entity_ids: ids }, options),
    tags: (query = {}, options) => get("/v2/tags", query, options),
    compare: () => {
      throw new Error("Live Qloo comparison is not enabled in this planner.")
    },
    trending: () => {
      throw new Error("Live Qloo trends are not enabled in this planner.")
    },
  }
}
