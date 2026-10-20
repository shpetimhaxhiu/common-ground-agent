import "dotenv/config"
// Explicit live smoke test. Uses event quota and the approved OpenAI key.
import { config } from "dotenv"
import { mkdir, writeFile } from "node:fs/promises"
import { initialRequest } from "../lib/domain"
import { planWithAgent } from "../lib/planning-agent"
config({ path: ".env", quiet: true })
try {
  const result = await planWithAgent({
    ...initialRequest,
    mode: "live",
    assistance: "agent",
    city: "New York City",
    participants: initialRequest.participants
      .slice(0, 2)
      .map((p, i) => ({ ...p, interests: [i ? "Coffee" : "Jazz"] })),
    resolutions: [
      { input: "Coffee", id: "urn:tag:cuisine:qloo:coffee", name: "Coffee" },
    ],
  })
  if (!result.agent || !result.candidates.length)
    throw new Error("No verified agent shortlist.")
  await mkdir(".runtime", { recursive: true })
  await writeFile(
    ".runtime/agent-live-result.json",
    JSON.stringify(result, null, 2)
  )
  console.log(
    JSON.stringify({
      mode: result.mode,
      candidateCount: result.candidates.length,
      model: result.agent.model,
      toolCalls: result.agent.activity.length,
      modelCalls: result.agent.modelCalls,
      inputTokens: result.agent.inputTokens,
      outputTokens: result.agent.outputTokens,
    })
  )
} catch (error) {
  // Never dump SDK request objects, headers, provider bodies or the key.
  console.error(
    JSON.stringify({
      passed: false,
      errorType: error instanceof Error ? error.name : "Unknown",
      code:
        error && typeof error === "object" && "code" in error
          ? error.code
          : undefined,
      status:
        error && typeof error === "object" && "status" in error
          ? error.status
          : undefined,
    })
  )
  process.exitCode = 1
}
