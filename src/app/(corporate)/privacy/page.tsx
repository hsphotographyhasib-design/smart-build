import type { Metadata } from "next"
import { company } from "@/lib/corporate-data"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Hasanur Jaya Sdn Bhd collects, uses, and protects your personal information.",
}

const sections = [
  {
    title: "Information We Collect",
    body: "We collect information you provide directly to us — such as your name, email address, phone number, and project details — when you request a quotation, contact us, apply for a career opportunity, or register for access to the HJSB EPPM platform.",
  },
  {
    title: "How We Use Your Information",
    body: "We use the information we collect to respond to your enquiries, prepare quotations, deliver our services, manage projects through the HJSB EPPM platform, process job applications, and communicate with you about our work. We do not sell your personal information to third parties.",
  },
  {
    title: "HJSB EPPM Platform",
    body: "Access to the HJSB EPPM platform is restricted to authorized employees, clients, consultants, and project partners. Account credentials, project data, and activity within the platform are protected with role-based access control and encrypted authentication.",
  },
  {
    title: "Data Security",
    body: "We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.",
  },
  {
    title: "Data Retention",
    body: "We retain personal information only for as long as necessary to fulfil the purposes for which it was collected, including legal, accounting, and contractual requirements.",
  },
  {
    title: "Contact Us",
    body: `If you have any questions about this privacy policy or how we handle your information, contact us at ${company.email} or ${company.phone}.`,
  },
]

export default function PrivacyPage() {
  return (
    <>
      <section className="relative py-32 lg:py-40 bg-corp-charcoal">
        <div className="container-corp">
          <span className="inline-block text-corp-gold text-xs font-semibold tracking-[0.2em] uppercase mb-4">Legal</span>
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-white leading-tight">Privacy Policy</h1>
        </div>
      </section>
      <section className="section-padding bg-white">
        <div className="container-corp max-w-3xl">
          <p className="text-gray-600 leading-relaxed mb-10">
            {company.name} (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;) is committed to protecting your privacy. This policy explains how we collect, use, and safeguard your information when you use our website and the HJSB EPPM platform.
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
