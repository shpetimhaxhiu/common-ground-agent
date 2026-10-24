import { cookies } from "next/headers"
import { createHash, randomBytes } from "node:crypto"
import { z } from "zod"
import { db } from "@/lib/db"
import { requestSchema } from "@/lib/domain"
import type { Prisma } from "@/generated/prisma/client"
import { agentReportSchema } from "@/lib/agent-contract"
import { coverageSchema } from "@/lib/coverage"
import { culturalSeedSchema } from "@/lib/cultural-seeds"

const candidateSchema = z.object({
  id: z.string().max(150),
  name: z.string().max(200),
  kind: z.string().max(200),
  description: z.string().max(3000),
  address: z.string().nullable(),
  source: z.enum(["fictional-sample", "qloo"]),
  interests: z.array(z.string().max(100)).max(20),
  quiet: z.boolean().nullable(),
  price: z.number().nullable(),
  note: z.string().max(3000),
  links: z
    .array(z.object({ label: z.string().max(100), url: z.url().max(1000) }))
    .max(5),
})
const savedSchema = z.object({
  candidate: candidateSchema,
  result: z.object({
    resolvedSeeds: z.array(culturalSeedSchema).max(8).optional(),
    agent: agentReportSchema.optional(),
    coverage: coverageSchema.optional(),
    resolvedTags: z
      .array(z.object({ input: z.string(), id: z.string(), name: z.string() }))
      .max(8)
      .optional(),
    mode: z.enum(["sample", "live"]),
    candidates: z.array(candidateSchema).max(12),
    trace: z.array(z.string().max(500)).max(12),
    warnings: z.array(z.string().max(1000)).max(12),
    interpretation: z.array(z.string().max(150)).max(30),
    createdAt: z.iso.datetime(),
    request: requestSchema,
  }),
})
const cookieName = "cg_collection"
const hash = (value: string) => createHash("sha256").update(value).digest("hex")
export async function GET() {
  const token = (await cookies()).get(cookieName)?.value
  if (!token || !/^[a-f0-9]{64}$/.test(token))
    return Response.json({ plans: [] })
  try {
    const records = await db.savedPlan.findMany({
      where: { ownerHash: hash(token) },
      orderBy: { createdAt: "desc" },
      take: 30,
    })
    return Response.json(
      {
        plans: records.map((record) => ({
          id: record.id,
          title: record.title,
          createdAt: record.createdAt,
          ...(record.payload as object),
        })),
      },
      { headers: { "Cache-Control": "no-store" } }
    )
  } catch (error) {
    console.error("Saved collection unavailable", {
      code:
        error && typeof error === "object" && "code" in error
          ? String(error.code)
          : "unknown",
    })
    return Response.json(
      { error: "The plan collection is temporarily unavailable." },
      { status: 503 }
    )
  }
}
export async function POST(request: Request) {
  if (
    request.headers.get("origin") !==
    new URL(process.env.BETTER_AUTH_URL ?? request.url).origin
  )
    return Response.json({ error: "Invalid origin." }, { status: 403 })
  const text = await request.text()
  if (Buffer.byteLength(text) > 64000)
    return Response.json({ error: "Plan too large." }, { status: 413 })
  const parsed = savedSchema.safeParse(
    (() => {
      try {
        return JSON.parse(text)
      } catch {
        return null
      }
    })()
  )
  if (!parsed.success)
    return Response.json({ error: "This plan is invalid." }, { status: 400 })
  if (
    !parsed.data.result.candidates.some(
      (c) => c.id === parsed.data.candidate.id
    )
  )
    return Response.json(
      { error: "Choose an option from this shortlist." },
      { status: 400 }
    )
  const jar = await cookies()
  const previous = jar.get(cookieName)?.value
  const token =
    previous && /^[a-f0-9]{64}$/.test(previous)
      ? previous
      : randomBytes(32).toString("hex")
  try {
    const ownerHash = hash(token)
    if ((await db.savedPlan.count({ where: { ownerHash } })) >= 50)
      return Response.json(
        { error: "This browser collection has reached its 50-plan limit." },
        { status: 409 }
      )
    const record = await db.savedPlan.create({
      data: {
        ownerHash,
        title: parsed.data.candidate.name,
        payload: parsed.data as unknown as Prisma.InputJsonValue,
      },
    })
    jar.set(cookieName, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    })
    return Response.json({ id: record.id }, { status: 201 })
  } catch (error) {
    console.error("Saved plan persistence unavailable", {
      code:
        error && typeof error === "object" && "code" in error
          ? String(error.code)
          : "unknown",
    })
    return Response.json(
      { error: "The plan could not be stored." },
      { status: 503 }
    )
  }
}
