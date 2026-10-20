import type { NextConfig } from "next"
const nextConfig: NextConfig = {
  serverExternalPackages: ["@qloo/qloo-harness"],
  outputFileTracingIncludes: { "/api/*": ["./certs/hetzner-sql-ca.pem"] },
}
export default nextConfig
