import { betterAuth } from "better-auth"
import { prismaAdapter } from "@better-auth/prisma-adapter"
import { db } from "./db"
// Authentication foundation. No account or password is needed for the browser-local collection.
export const auth = betterAuth({
  database: prismaAdapter(db, { provider: "postgresql" }),
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  emailAndPassword: { enabled: false },
  trustedOrigins: [process.env.BETTER_AUTH_URL ?? "http://127.0.0.1:3161"],
})
