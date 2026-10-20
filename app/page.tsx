import { PlanningWorkspace } from "@/components/planning-workspace"
export default function Page() {
  return (
    <PlanningWorkspace
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
