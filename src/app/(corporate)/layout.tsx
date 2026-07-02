import type { Metadata } from "next"
import Header from "@/components/corporate/header"
import Footer from "@/components/corporate/footer"

export const metadata: Metadata = {
  title: "Hasanur Jaya Sdn Bhd — Building Brunei's Future",
  description:
    "Premier construction and development company in Brunei since 1995. Specializing in general construction, architectural design, project management, infrastructure, renovation, and green building.",
}

export default function CorporateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  )
}
