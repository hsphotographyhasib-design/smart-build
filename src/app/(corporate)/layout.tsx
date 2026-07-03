import type { Metadata } from "next"
import Header from "@/components/corporate/header"
import Footer from "@/components/corporate/footer"
import { company } from "@/lib/corporate-data"

const siteDescription =
  "Hasanur Jaya Sdn Bhd is a leading construction company in Brunei Darussalam — general contractor, civil engineering, mechanical & electrical, infrastructure, and facility maintenance services for government and private-sector clients since 1995."

export const metadata: Metadata = {
  metadataBase: new URL(company.website),
  title: {
    absolute: "Hasanur Jaya Sdn Bhd — Building Brunei's Future with Engineering Excellence",
    template: "%s | Hasanur Jaya Sdn Bhd",
  },
  description: siteDescription,
  keywords: [
    "Construction Company Brunei",
    "General Contractor Brunei",
    "Civil Engineering Brunei",
    "Facility Maintenance Brunei",
    "Mechanical & Electrical Contractor",
    "Infrastructure Contractor",
    "Building Construction Brunei",
    "Hasanur Jaya",
    "HJSB EPPM",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: company.website,
    siteName: company.name,
    title: "Hasanur Jaya Sdn Bhd — Building Brunei's Future with Engineering Excellence",
    description: siteDescription,
    images: [
      {
        url: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1200&h=630&q=75",
        width: 1200,
        height: 630,
        alt: "Hasanur Jaya Sdn Bhd construction site in Brunei Darussalam",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hasanur Jaya Sdn Bhd — Construction & Engineering in Brunei",
    description: siteDescription,
    images: ["https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1200&h=630&q=75"],
  },
  robots: {
    index: true,
    follow: true,
  },
}

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "GeneralContractor",
      "@id": `${company.website}/#organization`,
      name: company.name,
      alternateName: "HJSB",
      url: company.website,
      description: siteDescription,
      foundingDate: String(company.founded),
      telephone: company.phone,
      email: company.email,
      address: {
        "@type": "PostalAddress",
        streetAddress: "No 17, Spg 42, Jalan Batu Bersurat",
        addressLocality: "Bandar Seri Begawan",
        addressCountry: "BN",
      },
      areaServed: {
        "@type": "Country",
        name: "Brunei Darussalam",
      },
      sameAs: [company.social.facebook, company.social.linkedin],
      openingHours: "Mo-Sa 08:00-17:00",
      knowsAbout: [
        "General Construction",
        "Civil Engineering",
        "Mechanical & Electrical",
        "Facility Maintenance",
        "Infrastructure Development",
        "Project Management",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${company.website}/#website`,
      url: company.website,
      name: company.name,
      publisher: { "@id": `${company.website}/#organization` },
    },
  ],
}

export default function CorporateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  )
}
