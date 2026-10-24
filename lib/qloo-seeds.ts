import type { QlooToolClient } from "@qloo/qloo-harness"
import { z } from "zod"
import { culturalSeedSchema, type CulturalSeed } from "./cultural-seeds"

const entityRecordsSchema = z
  .array(
    z.object({
      entity_id: z.uuid(),
      name: z.string().min(1).max(200),
      types: z.array(z.string()).optional(),
      type: z.string().optional(),
      properties: z
        .object({
          short_description: z.string().nullish(),
          description: z.string().nullish(),
        })
        .passthrough()
        .nullish(),
    })
  )
  .max(30)
const recordsSchema = z.object({
  results: z.union([
    entityRecordsSchema,
    z.object({ entities: entityRecordsSchema }),
  ]),
})

export function parseCulturalRecords(
  payload: unknown,
  type: CulturalSeed["type"]
) {
  const parsed = recordsSchema.parse(payload)
  const records = Array.isArray(parsed.results)
    ? parsed.results
    : parsed.results.entities
  return records
    .filter((e) => (e.types ?? [e.type]).includes(`urn:entity:${type}`))
    .map((e) => ({
      id: e.entity_id,
      name: e.name,
      type,
      description: (
        e.properties?.short_description ??
        e.properties?.description ??
        ""
      ).slice(0, 280),
    }))
}

export async function verifyCulturalSeeds(
  client: QlooToolClient,
  seeds: CulturalSeed[],
  signal: AbortSignal
) {
  const unique = [
    ...new Map(seeds.map((s) => [s.id.toLowerCase(), s])).values(),
  ]
  if (!unique.length) return []
  const response = await client.entities(
    unique.map((s) => s.id),
    { signal }
  )
  return unique.map((seed) => {
    const record = parseCulturalRecords(response, seed.type).find(
      (e) => e.id.toLowerCase() === seed.id.toLowerCase()
    )
    if (!record)
      throw new Error(
        "Qloo could not verify a selected cultural record or its type. Search and select it again."
      )
    return culturalSeedSchema.parse(record)
  })
}
