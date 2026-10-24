import { initialRequest, type PlanningRequest } from "./domain"
import type { SignalCoverage } from "./coverage"

export function profileSignalSummary(coverage: SignalCoverage, index: number) {
  const ranks = coverage.rows
    .map((row) => row.ranks[index])
    .filter(
      (rank): rank is number =>
        typeof rank === "number" && Number.isFinite(rank)
    )
  if (ranks.length < 2)
    return "Not enough returned scores to compare this profile."
  const levels = new Set(ranks).size
  return levels === 1
    ? "All returned places are tied for this profile. Qloo does not separate them within this shortlist."
    : `Qloo separates these places into ${levels} relative ranks for this profile.`
}

export function liveExample(date: string): PlanningRequest {
  return {
    ...initialRequest,
    date,
    mode: "live",
    assistance: "compare",
    city: "New York City",
    participants: initialRequest.participants.slice(0, 2).map((p, i) => ({
      ...p,
      name: i ? "Sam" : "Alex",
      interests: [i ? "Coffee" : "Jazz"],
    })),
    resolutions: [
      { input: "Coffee", id: "urn:tag:cuisine:qloo:coffee", name: "Coffee" },
    ],
  }
}

const categories: Record<string, { label: string; explanation: string }> = {
  interests: {
    label: "Personal interest",
    explanation: "An interest or subject you enjoy.",
  },
  setting: {
    label: "Venue setting",
    explanation: "The kind of environment or setting you have in mind.",
  },
  activity_type: {
    label: "Activity",
    explanation: "Something you want to do together.",
  },
  cuisine: {
    label: "Food & drink",
    explanation:
      "A food or drink interest, rather than a verified menu or dietary guarantee.",
  },
  genre: {
    label: "Genre",
    explanation: "A cultural genre, such as a style of music or film.",
  },
  amenity: {
    label: "Venue feature",
    explanation:
      "A place-related feature. Check current details directly with the venue.",
  },
}

export function qlooTagCategory(id: string, type?: string) {
  return (
    categories[(type?.startsWith("urn:tag:") ? type : id).split(":")[2]] ?? {
      label: "Qloo taste category",
      explanation:
        "A distinct meaning returned by Qloo. Choose it only if it matches your intended interest.",
    }
  )
}
