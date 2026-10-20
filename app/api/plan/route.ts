import { requestSchema, planSample } from "@/lib/domain"
import { planLive, QlooResolutionError } from "@/lib/qloo"
import { QlooTransportError } from "@/lib/qloo-client"
import { planWithAgent } from "@/lib/planning-agent"

export const runtime = "nodejs"
export const maxDuration = 120
export async function POST(request: Request) {
  if (
    request.headers.get("origin") !==
    new URL(process.env.BETTER_AUTH_URL ?? request.url).origin
  )
    return Response.json(
      { error: "This request must come from the app." },
      { status: 403 }
    )
  if (Number(request.headers.get("content-length") ?? 0) > 12_000)
    return Response.json({ error: "Request is too large." }, { status: 413 })
  try {
    const text = await request.text()
    if (Buffer.byteLength(text) > 12_000)
      return Response.json({ error: "Request is too large." }, { status: 413 })
    const input = requestSchema.parse(JSON.parse(text))
    if (input.mode === "live" && process.env.ENABLE_LIVE_QLOO !== "true")
      return Response.json(
        {
          error:
            "Live Qloo is disabled on this server. The sample workspace is available separately.",
        },
        { status: 503 }
      )
    if (
      input.mode === "live" &&
      input.assistance === "agent" &&
      (process.env.ENABLE_PLANNING_AGENT !== "true" ||
        !process.env.OPENAI_API_KEY)
    )
      return Response.json(
        {
          error:
            "The planning agent is disabled on this server. Choose direct Qloo results instead.",
        },
        { status: 503 }
      )
    return Response.json(
      input.mode === "sample"
        ? planSample(input)
        : input.assistance === "agent"
          ? await planWithAgent(input)
          : await planLive(input),
      { headers: { "Cache-Control": "no-store" } }
    )
  } catch (error) {
    let cause: unknown = error
    for (let depth = 0; depth < 5 && cause instanceof Error; depth++) {
      if (cause instanceof QlooTransportError)
        return Response.json({ error: cause.message }, { status: cause.status })
      cause = cause.cause
    }
    if (error instanceof QlooResolutionError)
      return Response.json(
        { error: error.message, resolutionIssues: error.issues },
        { status: 409 }
      )
    if (error && typeof error === "object" && "code" in error) {
      const code = String(error.code)
      const messages: Record<string, string> = {
        QLOO_AUTH:
          "Live Qloo access was rejected. Check the server credentials and event access period.",
        QLOO_RATE_LIMIT:
          "Live Qloo has reached a usage limit. Wait before trying again.",
        QLOO_TIMEOUT:
          "Live Qloo took too long. Your inputs are preserved; try again later.",
      }
      if (messages[code])
        return Response.json(
          { error: messages[code] },
          { status: code === "QLOO_RATE_LIMIT" ? 429 : 502 }
        )
    }
    if (error instanceof SyntaxError)
      return Response.json(
        { error: "The request could not be read." },
        { status: 400 }
      )
    if (error && typeof error === "object" && "issues" in error)
      return Response.json(
        {
          error:
            "Check the group, city, budget, date and time. Each person needs at least one interest.",
        },
        { status: 400 }
      )
    const message = error instanceof Error ? error.message : ""
    const allowed = [
      "The fictional sample",
      "Live Qloo",
      "Qloo could not",
      "Qloo did not",
      "The planning agent",
    ]
    return Response.json(
      {
        error: allowed.some((prefix) => message.startsWith(prefix))
          ? message
          : "The planning provider is unavailable. Your inputs are preserved; try again later.",
      },
      { status: 502 }
    )
  }
}
