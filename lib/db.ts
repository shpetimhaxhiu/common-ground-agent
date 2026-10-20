import { PrismaClient } from "@/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
const cache = globalThis as unknown as { commonGroundDb?: PrismaClient }
export const db =
  cache.commonGroundDb ??
  new PrismaClient({
    adapter: new PrismaPg({
      connectionString: process.env.DATABASE_URL,
      max: 5,
    }),
  })
if (process.env.NODE_ENV !== "production") cache.commonGroundDb = db
