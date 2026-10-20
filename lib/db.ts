import { PrismaClient } from "@/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { readFileSync } from "node:fs"
const url = process.env.DATABASE_URL
  ? new URL(process.env.DATABASE_URL)
  : undefined
const schema = url?.searchParams.get("schema") ?? "public"
const remoteTls = url?.hostname.endsWith(".your-database.de")
if (remoteTls && !/^codex_common_ground_agent_[a-z0-9_]+$/.test(schema))
  throw new Error("Missing isolated database schema")
if (remoteTls) {
  url!.searchParams.delete("sslmode")
  url!.searchParams.delete("sslrootcert")
}
const cache = globalThis as unknown as { commonGroundDb?: PrismaClient }
export const db =
  cache.commonGroundDb ??
  new PrismaClient({
    adapter: new PrismaPg(
      {
        connectionString: url?.toString(),
        ...(remoteTls
          ? {
              ssl: {
                ca: readFileSync(
                  new URL("../certs/hetzner-sql-ca.pem", import.meta.url),
                  "utf8"
                ),
                rejectUnauthorized: true,
              },
            }
          : {}),
        max: 5,
      },
      { schema }
    ),
  })
if (process.env.NODE_ENV !== "production") cache.commonGroundDb = db
