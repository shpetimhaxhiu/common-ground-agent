// Opt-in live verification. Never runs as part of the offline test suite.
import { config } from "dotenv"
import { mkdir, writeFile } from "node:fs/promises"
import { initialRequest } from "../lib/domain"
import { planLive } from "../lib/qloo"
config({ path: ".env.local", quiet: true })
config({ path: ".env", quiet: true })
const result = await planLive({
  ...initialRequest,
  mode: "live",
  city: "New York City",
  participants: initialRequest.participants
    .slice(0, 2)
    .map((p, i) => ({ ...p, interests: [i ? "Coffee" : "Jazz"] })),
  // This tag choice was returned by the actual Qloo resolver during verification.
  resolutions: [
    { input: "Coffee", id: "urn:tag:cuisine:qloo:coffee", name: "Coffee" },
  ],
})
await mkdir(".runtime", { recursive: true })
await writeFile(
  ".runtime/qloo-live-result.json",
  JSON.stringify(result, null, 2)
)
console.log(
  JSON.stringify({
    mode: result.mode,
    count: result.candidates.length,
    source: result.candidates[0]?.source,
    pricesUnknown: result.candidates.every((c) => c.price === null),
  })
)
if (!result.candidates.length)
  throw new Error("Live verification returned no candidates.")
