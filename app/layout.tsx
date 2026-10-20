import type { Metadata } from "next"
import "./globals.css"
export const metadata: Metadata = {
  title: "Common Ground — a good evening, together",
  description:
    "Bring different tastes to the table. Explore a shared shortlist and make a plan together.",
}
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
