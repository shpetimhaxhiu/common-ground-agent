import { z } from "zod"
import type { AgentReport } from "./agent-contract"

export const requestSchema = z.object({
  mode: z.enum(["sample", "live"]),
  assistance: z.enum(["qloo", "agent"]).optional(),
  city: z.string().trim().min(2).max(80),
  participants: z
    .array(
      z.object({
        id: z.string().max(40),
        name: z.string().trim().min(1).max(30),
        interests: z.array(z.string().trim().min(1).max(100)).min(1).max(5),
      })
    )
    .min(2)
    .max(4),
  budget: z.coerce.number().min(0).max(1000),
  date: z.iso.date(),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  revision: z.enum(["balanced", "quieter", "less-expensive", "surprise"]),
  excluded: z.array(z.string().max(150)).max(20),
  resolutions: z
    .array(
      z.object({
        input: z.string().min(1).max(100),
        id: z
          .string()
          .regex(/^urn:tag:[a-zA-Z0-9:_-]+$/)
          .max(200),
        name: z.string().min(1).max(100),
      })
    )
    .max(20)
    .optional(),
})
export type PlanningRequest = z.infer<typeof requestSchema>
export type Candidate = {
  id: string
  name: string
  kind: string
  description: string
  address: string | null
  source: "fictional-sample" | "qloo"
  interests: string[]
  quiet: boolean | null
  price: number | null
  note: string
  links: { label: string; url: string }[]
}
export type PlanningResult = {
  agent?: AgentReport
  mode: "sample" | "live"
  candidates: Candidate[]
  trace: string[]
  warnings: string[]
  interpretation: string[]
  createdAt: string
  request: PlanningRequest
}

export const initialRequest: PlanningRequest = {
  mode: "sample",
  city: "Prishtina",
  budget: 25,
  date: "2026-10-24",
  time: "18:30",
  revision: "balanced",
  excluded: [],
  participants: [
    { id: "a", name: "Mira", interests: ["Jazz", "Independent cinema"] },
    { id: "b", name: "Leo", interests: ["Contemporary art", "Coffee"] },
    { id: "c", name: "Noor", interests: ["Bookshops", "Vegetarian food"] },
  ],
}

export const sampleCandidates: Candidate[] = [
  {
    id: "paper-moon",
    name: "Paper Moon",
    kind: "Listening café",
    description:
      "A record corner, a shared table, and something new on the turntable.",
    address: "Fictional sample · central Prishtina",
    source: "fictional-sample",
    interests: ["Jazz", "Coffee", "Bookshops"],
    quiet: true,
    price: 14,
    note: "The widest overlap in this sample. Music remains part of the setting.",
    links: [],
  },
  {
    id: "frame-table",
    name: "Frame & Table",
    kind: "Gallery kitchen",
    description:
      "Start with a small exhibition. Stay for a generous vegetarian supper.",
    address: "Fictional sample · central Prishtina",
    source: "fictional-sample",
    interests: ["Contemporary art", "Vegetarian food", "Independent cinema"],
    quiet: false,
    price: 24,
    note: "More of a shared meal; less of a listening evening.",
    links: [],
  },
  {
    id: "margins",
    name: "Margins",
    kind: "Bookshop café",
    description:
      "A slower evening between shelves, with coffee and room for a conversation.",
    address: "Fictional sample · central Prishtina",
    source: "fictional-sample",
    interests: ["Bookshops", "Coffee", "Contemporary art"],
    quiet: true,
    price: 10,
    note: "A quieter sample alternative. No cinema or music programme is assumed.",
    links: [],
  },
  {
    id: "after-image",
    name: "After Image",
    kind: "Screening room",
    description:
      "A short independent film followed by a conversation around the long table.",
    address: "Fictional sample · central Prishtina",
    source: "fictional-sample",
    interests: ["Independent cinema", "Contemporary art"],
    quiet: false,
    price: 12,
    note: "Strong film and art overlap; food is not included in the sample plan.",
    links: [],
  },
  {
    id: "green-note",
    name: "The Green Note",
    kind: "Neighbourhood kitchen",
    description: "A vegetable-led menu and records chosen for the evening.",
    address: "Fictional sample · central Prishtina",
    source: "fictional-sample",
    interests: ["Vegetarian food", "Jazz"],
    quiet: false,
    price: 19,
    note: "A food-first option; verify everyone is happy with a music-led setting.",
    links: [],
  },
]

const normalize = (text: string) => text.trim().toLocaleLowerCase()
export function sampleSupport(
  candidate: Candidate,
  person: PlanningRequest["participants"][number]
) {
  return person.interests.filter((interest) =>
    candidate.interests.some((tag) => normalize(tag) === normalize(interest))
  )
}
export function planSample(request: PlanningRequest): PlanningResult {
  if (normalize(request.city) !== "prishtina")
    throw new Error(
      "The fictional sample is set in Prishtina. Choose Prishtina or switch to live Qloo mode."
    )
  const eligible = sampleCandidates.filter(
    (c) =>
      !request.excluded.includes(c.id) &&
      c.price !== null &&
      c.price <= request.budget &&
      (request.revision !== "quieter" || c.quiet)
  )
  const ranked = [...eligible].sort((a, b) => {
    if (request.revision === "less-expensive")
      return (a.price ?? 0) - (b.price ?? 0)
    const support = (c: Candidate) =>
      request.participants.reduce(
        (sum, p) => sum + (sampleSupport(c, p).length > 0 ? 1 : 0),
        0
      )
    const total = (c: Candidate) =>
      request.participants.reduce(
        (sum, p) => sum + sampleSupport(c, p).length,
        0
      )
    return (
      support(b) - support(a) ||
      total(b) - total(a) ||
      (a.price ?? 0) - (b.price ?? 0)
    )
  })
  if (request.revision === "surprise" && ranked.length > 1)
    ranked.push(ranked.shift()!)
  return {
    mode: "sample",
    candidates: ranked.slice(0, 3),
    request,
    interpretation: request.participants.flatMap((p) => p.interests),
    createdAt: new Date().toISOString(),
    trace: [
      "Read the group’s explicit interests",
      "Matched fictional venue tags; no AI or Qloo request",
      "Applied sample budget and exclusions",
      `Returned ${Math.min(ranked.length, 3)} options; no reservations made`,
    ],
    warnings: [
      "All venues, prices and conditions in sample mode are fictional.",
      "Sample opening hours, availability and accessibility are unknown.",
    ],
  }
}

export function makePlanText(result: PlanningResult, candidate: Candidate) {
  return [
    `COMMON GROUND`,
    `${result.mode === "sample" ? "FICTIONAL SAMPLE — not a real venue recommendation" : "Qloo-backed shortlist — details need verification"}`,
    "",
    candidate.name,
    candidate.kind,
    `${result.request.city} · ${result.request.date} at ${result.request.time}`,
    `Group: ${result.request.participants.map((p) => p.name).join(", ")}`,
    `Budget target: €${result.request.budget} per person`,
    "",
    candidate.description,
    candidate.note,
    "",
    "Check before going: opening hours, current prices, availability, dietary suitability and access.",
    "No booking has been made.",
  ].join("\n")
}
