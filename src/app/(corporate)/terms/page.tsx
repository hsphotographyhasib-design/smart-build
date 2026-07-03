import type { Metadata } from "next"
import { company } from "@/lib/corporate-data"

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms and conditions governing the use of the Hasanur Jaya Sdn Bhd website and HJSB EPPM platform.",
}

const sections = [
  {
    title: "Use of This Website",
    body: "This website is provided for general information about our company, services, and projects. Content is provided in good faith but does not constitute a contractual offer. Project information, values, and timelines are indicative and subject to change.",
  },
  {
    title: "HJSB EPPM Platform Access",
    body: "Access to the HJSB EPPM platform is granted only to authorized users under the terms of their employment, contract, or client agreement. You are responsible for keeping your credentials confidential and for all activity under your account. Unauthorized access attempts are prohibited and may be reported to the relevant authorities.",
  },
  {
    title: "Intellectual Property",
    body: "All content on this website — including text, designs, logos, and images — is the property of Hasanur Jaya Sdn Bhd or its licensors and may not be reproduced without written permission.",
  },
  {
    title: "Quotations & Engagements",
    body: "Quotation requests submitted through this website are not binding until confirmed in a written agreement signed by both parties. All engagements are governed by the terms of the applicable contract.",
  },
  {
    title: "Limitation of Liability",
    body: "While we strive to keep information accurate and the website available, we make no warranties regarding completeness or uninterrupted access, and we accept no liability for losses arising from reliance on website content.",
  },
  {
    title: "Governing Law",
    body: "These terms are governed by the laws of Brunei Darussalam. Any disputes shall be subject to the exclusive jurisdiction of the courts of Brunei Darussalam.",
  },
  {
    title: "Contact",
    body: `Questions about these terms may be directed to ${company.email} or ${company.phone}.`,
  },
]

export default function TermsPage() {
  return (
    <>
      <section className="relative py-32 lg:py-40 bg-corp-charcoal">
        <div className="container-corp">
          <span className="inline-block text-corp-gold text-xs font-semibold tracking-[0.2em] uppercase mb-4">Legal</span>
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-white leading-tight">Terms of Use</h1>
        </div>
      </section>
      <section className="section-padding bg-white">
        <div className="container-corp max-w-3xl">
          <p className="text-gray-600 leading-relaxed mb-10">
            By accessing the {company.name} website or the HJSB EPPM platform, you agree to the following terms and conditions.
          </p>
          <div className="space-y-8">
            {sections.map((s) => (
              <div key={s.title}>
                <h2 className="font-heading text-xl font-bold text-corp-charcoal mb-3">{s.title}</h2>
                <p className="text-gray-600 leading-relaxed text-sm">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
