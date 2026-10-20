import { requestSchema, planSample } from "@/lib/domain"
import { planLive } from "@/lib/qloo"

export const runtime = "nodejs"
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
            "Live Qloo access is pending. Use the clearly labeled sample workspace while access is being configured.",
        },
        { status: 503 }
      )
    return Response.json(
      input.mode === "sample" ? planSample(input) : await planLive(input)
    )
  } catch (error) {
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
