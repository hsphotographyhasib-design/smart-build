'use client'

import Link from 'next/link'
import { useFormat } from '@/hooks/use-format'
import { Shield, Lock, Eye, Users, FileText, Mail, Calendar } from 'lucide-react'

export default function PrivacyPolicyPage() {
  const { getCallingCode } = useFormat()
  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-b from-stone-100 to-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Shield className="w-4 h-4" />
            Legal
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4">Privacy Policy</h1>
          <p className="text-stone-500 text-lg">Last updated: January 15, 2025</p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="prose prose-stone max-w-none space-y-10">
          {/* Introduction */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-stone-600" />
              </div>
              <h2 className="text-2xl font-bold text-stone-900">1. Introduction</h2>
            </div>
            <div className="text-stone-600 space-y-3 leading-relaxed">
              <p>
                SmartBuild Inc. (&quot;SmartBuild,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is committed to protecting the privacy and security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, use our construction management platform, or interact with our services.
              </p>
              <p>
                This Privacy Policy applies to all users of the SmartBuild platform, including but not limited to: general contractors, subcontractors, project managers, architects, engineers, suppliers, and any other individuals who access or use our services. By accessing or using SmartBuild, you agree to the practices described in this Privacy Policy.
              </p>
              <p>
                We encourage you to read this Privacy Policy carefully and to check this page periodically for changes. If you do not agree with the terms of this Privacy Policy, please do not access or use our services.
              </p>
            </div>
          </div>

          {/* Information We Collect */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center">
                <Eye className="w-5 h-5 text-stone-600" />
              </div>
              <h2 className="text-2xl font-bold text-stone-900">2. Information We Collect</h2>
            </div>
            <div className="text-stone-600 space-y-4 leading-relaxed">
              <h3 className="text-lg font-semibold text-stone-800">2.1 Information You Provide to Us</h3>
              <p>We collect information that you directly provide to us when you:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Create an account:</strong> Your name, email address, phone number, company name, job title, and password.</li>
                <li><strong>Complete your profile:</strong> Professional certifications, license numbers, areas of expertise, and company details including business address and tax identification numbers.</li>
                <li><strong>Create or manage projects:</strong> Project names, addresses, budgets, timelines, team member information, subcontractor details, and project documentation.</li>
                <li><strong>Process payments:</strong> Billing address, payment method details (credit card numbers are processed by our PCI-DSS compliant payment processors and are not stored on our servers), and invoicing information.</li>
                <li><strong>Communicate with us:</strong> Support ticket content, email correspondence, survey responses, and feedback submissions.</li>
                <li><strong>Upload content:</strong> Construction drawings, blueprints, photographs, documents, and any other files you upload to the platform.</li>
              </ul>

              <h3 className="text-lg font-semibold text-stone-800">2.2 Information Collected Automatically</h3>
              <p>When you access or use our services, we automatically collect certain information, including:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Device information:</strong> Hardware model, operating system and version, browser type and version, and unique device identifiers.</li>
                <li><strong>Usage information:</strong> Pages visited, features used, time spent on the platform, click patterns, and navigation paths through the application.</li>
                <li><strong>Log data:</strong> IP address, access times, referring URLs, and error logs that help us diagnose technical issues.</li>
                <li><strong>Location data:</strong> Approximate location based on your IP address. For mobile users, we may collect precise location data with your explicit consent for field-related features such as site check-ins and geofencing.</li>
              </ul>
            </div>
          </div>

          {/* How We Use Information */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-stone-600" />
              </div>
              <h2 className="text-2xl font-bold text-stone-900">3. How We Use Your Information</h2>
            </div>
            <div className="text-stone-600 space-y-3 leading-relaxed">
              <p>We use the information we collect for the following purposes:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>To provide and maintain our services:</strong> Enabling project management, document sharing, budgeting, scheduling, communication, and all other platform features.</li>
                <li><strong>To process transactions:</strong> Managing subscription billing, invoicing, payment processing, and financial reporting related to your account.</li>
                <li><strong>To communicate with you:</strong> Sending service-related notifications, account updates, security alerts, technical notices, and responses to your inquiries or support requests.</li>
                <li><strong>To improve our services:</strong> Analyzing usage patterns to understand how users interact with the platform, identifying areas for improvement, and developing new features and functionality.</li>
                <li><strong>To personalize your experience:</strong> Customizing the user interface, content recommendations, and feature suggestions based on your usage patterns and preferences.</li>
                <li><strong>To ensure security:</strong> Detecting, preventing, and addressing fraud, unauthorized access, data breaches, and other security threats.</li>
                <li><strong>To comply with legal obligations:</strong> Meeting regulatory requirements under applicable construction industry laws, tax regulations, data protection statutes, and government reporting obligations.</li>
              </ul>
            </div>
          </div>

          {/* Data Sharing */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-stone-600" />
              </div>
              <h2 className="text-2xl font-bold text-stone-900">4. Data Sharing and Disclosure</h2>
            </div>
            <div className="text-stone-600 space-y-3 leading-relaxed">
              <p>We do not sell your personal information. We may share your information in the following circumstances:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Within your organization:</strong> Project data, team member information, and collaboration content are shared among authorized users within your company and invited external collaborators as determined by your account administrator.</li>
                <li><strong>Service providers:</strong> We engage trusted third-party vendors who perform services on our behalf, including cloud hosting (AWS), payment processing (Stripe), email delivery, analytics, and customer support. These vendors are contractually obligated to protect your data and are prohibited from using it for their own purposes.</li>
                <li><strong>Legal requirements:</strong> We may disclose your information if required by law, subpoena, court order, or governmental regulation. We may also disclose information when we believe in good faith that disclosure is necessary to protect our rights, protect your safety or the safety of others, investigate fraud, or respond to a government request.</li>
                <li><strong>Business transfers:</strong> In the event of a merger, acquisition, reorganization, bankruptcy, or sale of all or a portion of our assets, user information may be transferred as part of that transaction. We will notify you via email or a prominent notice on our website before your information becomes subject to a different privacy policy.</li>
              </ul>
            </div>
          </div>

          {/* Data Security */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center">
                <Lock className="w-5 h-5 text-stone-600" />
              </div>
              <h2 className="text-2xl font-bold text-stone-900">5. Data Security</h2>
            </div>
            <div className="text-stone-600 space-y-3 leading-relaxed">
              <p>
                We implement industry-standard security measures to protect your personal information, including:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>AES-256 encryption for data at rest and TLS 1.3 encryption for data in transit.</li>
                <li>Multi-factor authentication (MFA) and role-based access controls (RBAC) for all user accounts.</li>
                <li>Regular security audits, vulnerability assessments, and penetration testing conducted by independent third-party security firms.</li>
                <li>SOC 2 Type II compliant infrastructure with continuous monitoring and intrusion detection systems.</li>
                <li>Automated data backups with geographic redundancy and point-in-time recovery capabilities.</li>
                <li>Employee security training programs and background checks for all personnel with access to user data.</li>
              </ul>
              <p>
                While we strive to protect your personal information, no method of transmission over the Internet or method of electronic storage is 100% secure. We cannot guarantee absolute security, and you acknowledge that you provide your information at your own risk.
              </p>
            </div>
          </div>

          {/* Cookies */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-stone-600" />
              </div>
              <h2 className="text-2xl font-bold text-stone-900">6. Cookies and Tracking Technologies</h2>
            </div>
            <div className="text-stone-600 space-y-3 leading-relaxed">
              <p>
                We use cookies, web beacons, pixels, and similar tracking technologies to collect information about your browsing activities. Cookies are small data files stored on your device that help us improve our services and your experience. For detailed information about the cookies we use and how to manage them, please refer to our{' '}
                <Link href="/cookie-policy" className="text-emerald-600 hover:text-emerald-700 underline font-medium">Cookie Policy</Link>.
              </p>
            </div>
          </div>

          {/* Your Rights */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center">
                <Shield className="w-5 h-5 text-stone-600" />
              </div>
              <h2 className="text-2xl font-bold text-stone-900">7. Your Rights</h2>
            </div>
            <div className="text-stone-600 space-y-3 leading-relaxed">
              <p>Depending on your location, you may have certain rights regarding your personal information:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Right of Access:</strong> You can request a copy of the personal information we hold about you.</li>
                <li><strong>Right to Rectification:</strong> You can request that we correct inaccurate or incomplete personal information.</li>
                <li><strong>Right to Erasure:</strong> You can request that we delete your personal information, subject to certain legal exceptions such as ongoing contractual obligations or legal requirements.</li>
                <li><strong>Right to Data Portability:</strong> You can request to receive your personal data in a structured, commonly used, and machine-readable format.</li>
                <li><strong>Right to Restrict Processing:</strong> You can request that we limit how we use your personal information in certain circumstances.</li>
                <li><strong>Right to Object:</strong> You can object to our processing of your personal information for direct marketing purposes or when based on legitimate interests.</li>
                <li><strong>Right to Withdraw Consent:</strong> Where processing is based on your consent, you can withdraw that consent at any time without affecting the lawfulness of processing carried out prior to withdrawal.</li>
              </ul>
              <p>
                To exercise any of these rights, please contact us at{' '}
                <a href="mailto:privacy@smartbuild.com" className="text-emerald-600 hover:text-emerald-700 underline font-medium">privacy@smartbuild.com</a>.
                We will respond to your request within 30 days, or such shorter period as required by applicable law.
              </p>
            </div>
          </div>

          {/* Changes to Policy */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-stone-600" />
              </div>
              <h2 className="text-2xl font-bold text-stone-900">8. Changes to This Privacy Policy</h2>
            </div>
            <div className="text-stone-600 space-y-3 leading-relaxed">
              <p>
                We may update this Privacy Policy from time to time to reflect changes in our practices, technologies, legal requirements, or other factors. When we make material changes, we will notify you by posting the revised policy on this page with an updated &quot;Last updated&quot; date and, for significant changes, by sending a notification to the email address associated with your account or by displaying a prominent notice within the platform.
              </p>
              <p>
                We encourage you to review this Privacy Policy periodically to stay informed about how we protect your information. Your continued use of the services after the effective date of any changes constitutes your acceptance of the updated policy.
              </p>
            </div>
          </div>

          {/* Contact Us */}
          <div className="bg-stone-50 rounded-2xl p-8 mt-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Mail className="w-5 h-5 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-stone-900">9. Contact Us</h2>
            </div>
            <div className="text-stone-600 space-y-3 leading-relaxed">
              <p>If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:</p>
              <div className="grid sm:grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="font-medium text-stone-800">Email:</p>
                  <a href="mailto:privacy@smartbuild.com" className="text-emerald-600 hover:text-emerald-700">privacy@smartbuild.com</a>
                </div>
                <div>
                  <p className="font-medium text-stone-800">Phone:</p>
                  <p>{getCallingCode()} 234 5678</p>
                </div>
                <div>
                  <p className="font-medium text-stone-800">Mailing Address:</p>
                  <p>SmartBuild Inc.<br />Attn: Privacy Officer<br />100 Innovation Drive, Suite 400<br />Austin, TX 78701<br />United States</p>
                </div>
                <div>
                  <p className="font-medium text-stone-800">Data Protection Officer:</p>
                  <a href="mailto:dpo@smartbuild.com" className="text-emerald-600 hover:text-emerald-700">dpo@smartbuild.com</a>
                </div>
              </div>
            </div>
          </div>

          {/* Related Links */}
          <div className="flex flex-wrap gap-4 pt-4 border-t border-stone-200">
            <Link href="/terms-of-service" className="text-emerald-600 hover:text-emerald-700 font-medium underline">Terms of Service</Link>
            <Link href="/cookie-policy" className="text-emerald-600 hover:text-emerald-700 font-medium underline">Cookie Policy</Link>
          </div>
        </div>
      </section>
    </div>
  )
}