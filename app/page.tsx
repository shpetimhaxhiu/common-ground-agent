import { PlanningWorkspace } from "@/components/planning-workspace"
export default function Page() {
  return (
    <PlanningWorkspace
      liveAvailable={
        process.env.ENABLE_LIVE_QLOO === "true" &&
        Boolean(process.env.QLOO_API_KEY)
      }
    />
  )
}
