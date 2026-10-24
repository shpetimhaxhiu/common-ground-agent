import { PlanningWorkspace } from "@/components/planning-workspace"
import { connection } from "next/server"
async function planningDate() {
  await connection()
  const date = new Date()
  date.setUTCDate(date.getUTCDate() + 3)
  return date.toISOString().slice(0, 10)
}
export default async function Page() {
  const initialDate = await planningDate()
  return (
    <PlanningWorkspace
      initialDate={initialDate}
      agentAvailable={
        process.env.ENABLE_PLANNING_AGENT === "true" &&
        Boolean(process.env.OPENAI_API_KEY)
      }
      liveAvailable={
        process.env.ENABLE_LIVE_QLOO === "true" &&
        Boolean(process.env.QLOO_API_KEY)
      }
    />
  )
}
