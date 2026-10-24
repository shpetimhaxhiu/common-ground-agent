import { z } from "zod"

export const culturalTypeSchema = z.enum(["artist", "movie", "book"])
export const culturalSeedSchema = z.object({
  id: z.uuid(),
  name: z.string().trim().min(1).max(200),
  type: culturalTypeSchema,
})
export type CulturalSeed = z.infer<typeof culturalSeedSchema>
export const culturalLabels = {
  artist: "Artist",
  movie: "Film",
  book: "Book",
} as const
export function profileInterests(profile: {
  interests: string[]
  seeds?: CulturalSeed[]
}) {
  return [
    ...profile.interests,
    ...(profile.seeds ?? []).map((s) =>
      `${culturalLabels[s.type]}: ${s.name}`.slice(0, 100)
    ),
  ]
}
