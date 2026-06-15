'use client'

import Link from 'next/link'
import { useFormat } from '@/hooks/use-format'
import { ScrollText, Building2, UserCheck, AlertTriangle, CreditCard, Scale, ShieldCheck, XCircle, Gavel, Mail } from 'lucide-react'

export default function TermsOfServicePage() {
  const { getCallingCode } = useFormat()
  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-b from-stone-100 to-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Scale className="w-4 h-4" />
            Legal
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4">Terms of Service</h1>
          <p className="text-stone-500 text-lg">Last updated: January 15, 2025</p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="prose prose-stone max-w-none space-y-10">
          {/* Acceptance of Terms */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center">
                <ScrollText className="w-5 h-5 text-stone-600" />
              </div>
              <h2 className="text-2xl font-bold text-stone-900">1. Acceptance of Terms</h2>
            </div>
            <div className="text-stone-600 space-y-3 leading-relaxed">
              <p>
                These Terms of Service (&quot;Terms&quot;) constitute a legally binding agreement between SmartBuild Inc. (&quot;SmartBuild,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) and you (&quot;User,&quot; &quot;you,&quot; or &quot;your&quot;) governing your access to and use of the SmartBuild construction management platform, website, and all related services (collectively, the &quot;Services&quot;).
              </p>
              <p>
                BY ACCESSING OR USING THE SERVICES, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THESE TERMS. IF YOU DO NOT AGREE TO ALL OF THESE TERMS, DO NOT ACCESS OR USE THE SERVICES.
              </p>
              <p>
                These Terms apply to all visitors, users, and others who access or use the Services. If you are using the Services on behalf of an organization, you represent and warrant that you have the authority to bind that organization to these Terms, and &quot;you&quot; and &quot;your&quot; will refer to that organization.
              </p>
            </div>
          </div>

          {/* Service Description */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-stone-600" />
              </div>
              <h2 className="text-2xl font-bold text-stone-900">2. Service Description</h2>
            </div>
            <div className="text-stone-600 space-y-3 leading-relaxed">
              <p>
                SmartBuild provides a cloud-based construction management platform designed for construction industry professionals. The Services include, but are not limited to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Project Management:</strong> Project planning, scheduling, task management, milestone tracking, and resource allocation tools.</li>
                <li><strong>Financial Management:</strong> Budget tracking, cost estimation, invoicing, payment processing, expense management, and financial reporting.</li>
                <li><strong>Document Management:</strong> Centralized storage, version control, sharing, and collaboration for construction documents, drawings, blueprints, and specifications.</li>
                <li><strong>Resource &amp; Workforce Management:</strong> Employee management, subcontractor coordination, equipment tracking, and material inventory management.</li>
                <li><strong>Communication &amp; Collaboration:</strong> Real-time messaging, notifications, comment threads, and stakeholder communication tools.</li>
                <li><strong>Reporting &amp; Analytics:</strong> Dashboards, custom reports, KPI tracking, and business intelligence for construction operations.</li>
                <li><strong>Maintenance Management:</strong> Work order management, preventive maintenance scheduling, SLA tracking, and technician dispatch.</li>
              </ul>
              <p>
                We reserve the right to modify, suspend, or discontinue any part of the Services at any time, with or without notice. We shall not be liable to you or any third party for any modification, suspension, or discontinuance of the Services.
              </p>
            </div>
          </div>

          {/* User Accounts */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-stone-600" />
              </div>
              <h2 className="text-2xl font-bold text-stone-900">3. User Accounts</h2>
            </div>
            <div className="text-stone-600 space-y-3 leading-relaxed">
              <p>To access certain features of the Services, you must create an account. You agree to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide accurate, current, and complete information during the registration process and keep your account information updated.</li>
                <li>Maintain the security and confidentiality of your login credentials and immediately notify us of any unauthorized use of your account.</li>
                <li>Accept responsibility for all activities that occur under your account, whether or not you authorized such activities.</li>
                <li>Not create multiple accounts for the purpose of abusing promotional offers, circumventing restrictions, or engaging in fraudulent activity.</li>
                <li>Not use another person&apos;s account without their explicit permission and our authorization.</li>
              </ul>
              <p>
                We reserve the right to suspend or terminate your account if any information provided is found to be inaccurate, incomplete, or in violation of these Terms.
              </p>
            </div>
          </div>

          {/* Acceptable Use */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-stone-600" />
              </div>
              <h2 className="text-2xl font-bold text-stone-900">4. Acceptable Use Policy</h2>
            </div>
            <div className="text-stone-600 space-y-3 leading-relaxed">
              <p>You agree not to use the Services to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Violate any applicable federal, state, local, or international law or regulation, including construction industry regulations, licensing requirements, and building codes.</li>
                <li>Upload, transmit, or distribute any content that is unlawful, defamatory, harassing, abusive, threatening, harmful, vulgar, obscene, or otherwise objectionable.</li>
                <li>Attempt to gain unauthorized access to any portion of the Services, other user accounts, or any systems or networks connected to the Services through hacking, password mining, or any other means.</li>
                <li>Interfere with or disrupt the Services, servers, or networks connected to the Services, including by introducing viruses, malware, or other harmful code.</li>
                <li>Use the Services for any purpose that is unlawful or prohibited by these Terms, or to solicit the performance of any illegal activity.</li>
                <li>Reverse engineer, decompile, disassemble, or otherwise attempt to discover the source code of the Services or any part thereof.</li>
                <li>Use automated means, including bots, scrapers, or spiders, to access the Services or collect information from the Services without our prior written consent.</li>
                <li>Remove, alter, or obscure any proprietary notices on the Services.</li>
              </ul>
              <p>
                We reserve the right to investigate and take appropriate action against anyone who, in our sole discretion, violates this provision, including removing offending content, suspending or terminating the account of such violators, and reporting violations to law enforcement authorities.
              </p>
            </div>
          </div>

          {/* Payment Terms */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-stone-600" />
              </div>
              <h2 className="text-2xl font-bold text-stone-900">5. Payment Terms</h2>
            </div>
            <div className="text-stone-600 space-y-3 leading-relaxed">
              <p>
                Certain features of the Services require a paid subscription. By subscribing to a paid plan, you agree to the following payment terms:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Billing Cycle:</strong> Subscriptions are billed in advance on a monthly or annual basis, depending on the plan selected. The billing period begins on the date of subscription purchase and renews automatically at the end of each billing cycle.</li>
                <li><strong>Pricing:</strong> All prices are listed in US Dollars and are exclusive of applicable taxes. We reserve the right to modify our pricing with at least 30 days&apos; advance written notice. Price changes will take effect at the start of your next billing cycle.</li>
                <li><strong>Payment Methods:</strong> We accept major credit cards (Visa, Mastercard, American Express), ACH bank transfers, and wire transfers. All payment transactions are processed securely through our PCI-DSS compliant payment processor.</li>
                <li><strong>Refund Policy:</strong> We offer a 14-day money-back guarantee for new subscribers. After the 14-day period, subscriptions are non-refundable. Partial-month refunds are not provided for unused portions of a billing period.</li>
                <li><strong>Failed Payments:</strong> If a payment fails, we will attempt to process the payment again within 3 business days. If the payment continues to fail, your account may be downgraded to a free plan or suspended until valid payment information is provided.</li>
                <li><strong>Cancellation:</strong> You may cancel your subscription at any time. Upon cancellation, you will retain access to the paid features until the end of your current billing period. No prorated refunds will be issued for early cancellation.</li>
              </ul>
            </div>
          </div>

          {/* Intellectual Property */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-stone-600" />
              </div>
              <h2 className="text-2xl font-bold text-stone-900">6. Intellectual Property</h2>
            </div>
            <div className="text-stone-600 space-y-3 leading-relaxed">
              <p>
                The Services and all associated content, features, and functionality (including but not limited to software, text, graphics, logos, icons, images, audio clips, digital downloads, and data compilations) are owned by SmartBuild Inc. and are protected by United States and international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
              <p>
                Subject to your compliance with these Terms and your payment of applicable fees, SmartBuild grants you a limited, non-exclusive, non-transferable, non-sublicensable, revocable license to access and use the Services for your internal business purposes during the subscription term.
              </p>
              <p>
                You retain all rights in any content you upload, create, or submit to the Services (&quot;User Content&quot;). By submitting User Content, you grant SmartBuild a worldwide, non-exclusive, royalty-free license to use, reproduce, process, adapt, modify, publish, transmit, display, and distribute such content solely for the purpose of providing, improving, and promoting the Services.
              </p>
            </div>
          </div>

          {/* Limitation of Liability */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-stone-600" />
              </div>
              <h2 className="text-2xl font-bold text-stone-900">7. Limitation of Liability</h2>
            </div>
            <div className="text-stone-600 space-y-3 leading-relaxed">
              <p>
                TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL SMARTBUILD, ITS AFFILIATES, DIRECTORS, EMPLOYEES, AGENTS, OR LICENSORS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>YOUR ACCESS TO OR USE OF (OR INABILITY TO ACCESS OR USE) THE SERVICES.</li>
                <li>ANY CONDUCT OR CONTENT OF ANY THIRD PARTY ON THE SERVICES.</li>
                <li>ANY CONTENT OBTAINED FROM THE SERVICES.</li>
                <li>UNAUTHORIZED ACCESS, USE, OR ALTERATION OF YOUR TRANSMISSIONS OR CONTENT.</li>
              </ul>
              <p>
                IN NO EVENT SHALL SMARTBUILD&apos;S TOTAL AGGREGATE LIABILITY TO YOU FOR ALL CLAIMS ARISING OUT OF OR RELATING TO THE SERVICES EXCEED THE GREATER OF (A) THE AMOUNT YOU PAID TO SMARTBUILD IN THE TWELVE (12) MONTHS PRIOR TO THE EVENT GIVING RISE TO THE LIABILITY, OR (B) ONE THOUSAND US DOLLARS ($1,000.00).
              </p>
              <p>
                SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OF CERTAIN WARRANTIES OR THE LIMITATION OR EXCLUSION OF LIABILITY FOR CERTAIN TYPES OF DAMAGES. ACCORDINGLY, SOME OF THE ABOVE LIMITATIONS MAY NOT APPLY TO YOU. TO THE EXTENT THAT WE MAY NOT, AS A MATTER OF APPLICABLE LAW, DISCLAIM ANY IMPLIED WARRANTY OR LIMIT OUR LIABILITIES, THE SCOPE AND DURATION OF SUCH WARRANTY AND THE EXTENT OF OUR LIABILITY SHALL BE THE MINIMUM PERMITTED UNDER SUCH APPLICABLE LAW.
              </p>
            </div>
          </div>

          {/* Termination */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-stone-600" />
              </div>
              <h2 className="text-2xl font-bold text-stone-900">8. Termination</h2>
            </div>
            <div className="text-stone-600 space-y-3 leading-relaxed">
              <p>
                We may terminate or suspend your access to the Services immediately, without prior notice or liability, for any reason, including without limitation if you breach these Terms.
              </p>
              <p>
                Upon termination, your right to use the Services will immediately cease. All provisions of these Terms which by their nature should survive termination shall survive, including without limitation ownership provisions, warranty disclaimers, indemnification clauses, and limitations of liability.
              </p>
              <p>
                Upon account termination or expiration, we will retain your data for a period of 90 days. During this grace period, you may request an export of your data. After 90 days, all account data will be permanently and irretrievably deleted from our systems, except where we are legally required to retain certain information.
              </p>
            </div>
          </div>

          {/* Governing Law */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center">
                <Gavel className="w-5 h-5 text-stone-600" />
              </div>
              <h2 className="text-2xl font-bold text-stone-900">9. Governing Law</h2>
            </div>
            <div className="text-stone-600 space-y-3 leading-relaxed">
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the State of Texas, United States, without regard to its conflict of law provisions. Any disputes arising out of or relating to these Terms or the Services shall be resolved exclusively in the state or federal courts located in Travis County, Texas, and you consent to the personal jurisdiction of such courts.
              </p>
              <p>
                For any dispute that is not subject to arbitration, you and SmartBuild agree to submit to the personal and exclusive jurisdiction of the courts located in Travis County, Texas. You waive any and all objections to the exercise of jurisdiction over you by such courts and to venue in such courts.
              </p>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-stone-50 rounded-2xl p-8 mt-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Mail className="w-5 h-5 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-stone-900">10. Contact Us</h2>
            </div>
            <div className="text-stone-600 space-y-3 leading-relaxed">
              <p>
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="grid sm:grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="font-medium text-stone-800">Email:</p>
                  <a href="mailto:legal@smartbuild.com" className="text-emerald-600 hover:text-emerald-700">legal@smartbuild.com</a>
                </div>
                <div>
                  <p className="font-medium text-stone-800">Phone:</p>
                  <p>{getCallingCode()} 234 5678</p>
                </div>
                <div>
                  <p className="font-medium text-stone-800">Mailing Address:</p>
                  <p>SmartBuild Inc.<br />Attn: Legal Department<br />100 Innovation Drive, Suite 400<br />Austin, TX 78701<br />United States</p>
                </div>
              </div>
            </div>
          </div>

          {/* Related Links */}
          <div className="flex flex-wrap gap-4 pt-4 border-t border-stone-200">
            <Link href="/privacy-policy" className="text-emerald-600 hover:text-emerald-700 font-medium underline">Privacy Policy</Link>
            <Link href="/cookie-policy" className="text-emerald-600 hover:text-emerald-700 font-medium underline">Cookie Policy</Link>
          </div>
        </div>
      </section>
    </div>
  )
}