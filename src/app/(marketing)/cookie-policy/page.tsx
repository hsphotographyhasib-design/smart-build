'use client'

import Link from 'next/link'
import { useFormat } from '@/hooks/use-format'
import { Cookie, Settings, BarChart3, Lock, Globe, RefreshCw, Mail } from 'lucide-react'

export default function CookiePolicyPage() {
  const { getCallingCode } = useFormat()
  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-b from-stone-100 to-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Cookie className="w-4 h-4" />
            Legal
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4">Cookie Policy</h1>
          <p className="text-stone-500 text-lg">Last updated: January 15, 2025</p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="prose prose-stone max-w-none space-y-10">
          {/* What Are Cookies */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center">
                <Cookie className="w-5 h-5 text-stone-600" />
              </div>
              <h2 className="text-2xl font-bold text-stone-900">1. What Are Cookies?</h2>
            </div>
            <div className="text-stone-600 space-y-3 leading-relaxed">
              <p>
                Cookies are small text files that are placed on your device (computer, tablet, or mobile phone) when you visit a website. They are widely used to make websites work more efficiently, to provide a better browsing experience, and to supply information to the website owners.
              </p>
              <p>
                Cookies can be &quot;persistent&quot; (remaining on your device until they expire or you delete them) or &quot;session&quot; (deleted automatically when you close your browser). Cookies can be set by the website you are visiting (&quot;first-party cookies&quot;) or by third-party services operating on that website (&quot;third-party cookies&quot;).
              </p>
              <p>
                This Cookie Policy explains how SmartBuild Inc. (&quot;SmartBuild,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) uses cookies and similar tracking technologies when you visit our website and use our construction management platform. This policy should be read alongside our{' '}
                <Link href="/privacy-policy" className="text-emerald-600 hover:text-emerald-700 underline font-medium">Privacy Policy</Link>, which provides more detail on how we handle your personal data.
              </p>
            </div>
          </div>

          {/* Types of Cookies */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center">
                <Settings className="w-5 h-5 text-stone-600" />
              </div>
              <h2 className="text-2xl font-bold text-stone-900">2. Types of Cookies We Use</h2>
            </div>
            <div className="text-stone-600 space-y-4 leading-relaxed">
              <div className="bg-stone-50 rounded-xl p-6 space-y-3">
                <h3 className="text-lg font-semibold text-stone-800">2.1 Strictly Necessary Cookies</h3>
                <p>These cookies are essential for the operation of our website and platform. They enable core functionality such as security, network management, and accessibility. You cannot opt out of these cookies as the Services cannot function properly without them.</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-stone-200">
                        <th className="text-left py-2 pr-4 font-semibold text-stone-700">Cookie Name</th>
                        <th className="text-left py-2 pr-4 font-semibold text-stone-700">Purpose</th>
                        <th className="text-left py-2 font-semibold text-stone-700">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      <tr>
                        <td className="py-2 pr-4 font-mono text-xs">sb_session</td>
                        <td className="py-2 pr-4">Authenticates your session and maintains login state</td>
                        <td className="py-2">Session</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4 font-mono text-xs">sb_csrf</td>
                        <td className="py-2 pr-4">Prevents Cross-Site Request Forgery attacks</td>
                        <td className="py-2">Session</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4 font-mono text-xs">sb_preferences</td>
                        <td className="py-2 pr-4">Stores your display and accessibility preferences</td>
                        <td className="py-2">1 year</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4 font-mono text-xs">sb_consent</td>
                        <td className="py-2 pr-4">Records your cookie consent preferences</td>
                        <td className="py-2">1 year</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-stone-50 rounded-xl p-6 space-y-3">
                <h3 className="text-lg font-semibold text-stone-800">2.2 Performance and Analytics Cookies</h3>
                <p>These cookies collect information about how visitors use our website, such as which pages are visited most often, how users navigate between pages, and whether error messages are encountered. All information collected by these cookies is aggregated and anonymized.</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-stone-200">
                        <th className="text-left py-2 pr-4 font-semibold text-stone-700">Cookie Name</th>
                        <th className="text-left py-2 pr-4 font-semibold text-stone-700">Purpose</th>
                        <th className="text-left py-2 font-semibold text-stone-700">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      <tr>
                        <td className="py-2 pr-4 font-mono text-xs">_ga</td>
                        <td className="py-2 pr-4">Distinguishes unique visitors for Google Analytics</td>
                        <td className="py-2">2 years</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4 font-mono text-xs">_ga_ID</td>
                        <td className="py-2 pr-4">Maintains session state for Google Analytics</td>
                        <td className="py-2">2 years</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4 font-mono text-xs">sb_analytics</td>
                        <td className="py-2 pr-4">Tracks feature usage patterns within the platform</td>
                        <td className="py-2">1 year</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-stone-50 rounded-xl p-6 space-y-3">
                <h3 className="text-lg font-semibold text-stone-800">2.3 Functionality Cookies</h3>
                <p>These cookies allow the website to remember choices you make (such as your preferred language, region, or project view settings) and provide enhanced, personalized features. They may also be used to provide services you have requested, such as watching a video or commenting on a blog.</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-stone-200">
                        <th className="text-left py-2 pr-4 font-semibold text-stone-700">Cookie Name</th>
                        <th className="text-left py-2 pr-4 font-semibold text-stone-700">Purpose</th>
                        <th className="text-left py-2 font-semibold text-stone-700">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      <tr>
                        <td className="py-2 pr-4 font-mono text-xs">sb_locale</td>
                        <td className="py-2 pr-4">Remembers your language and regional preferences</td>
                        <td className="py-2">1 year</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4 font-mono text-xs">sb_dashboard</td>
                        <td className="py-2 pr-4">Saves your dashboard layout and widget preferences</td>
                        <td className="py-2">6 months</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4 font-mono text-xs">sb_recent</td>
                        <td className="py-2 pr-4">Stores your recently accessed projects for quick navigation</td>
                        <td className="py-2">30 days</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-stone-50 rounded-xl p-6 space-y-3">
                <h3 className="text-lg font-semibold text-stone-800">2.4 Marketing and Targeting Cookies</h3>
                <p>These cookies are used to track visitors across websites to display advertisements that are relevant and engaging for the individual user. They help us and our advertising partners deliver ads that are tailored to your interests and measure the effectiveness of advertising campaigns.</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-stone-200">
                        <th className="text-left py-2 pr-4 font-semibold text-stone-700">Cookie Name</th>
                        <th className="text-left py-2 pr-4 font-semibold text-stone-700">Purpose</th>
                        <th className="text-left py-2 font-semibold text-stone-700">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      <tr>
                        <td className="py-2 pr-4 font-mono text-xs">_fbp</td>
                        <td className="py-2 pr-4">Used by Facebook for ad targeting and measurement</td>
                        <td className="py-2">3 months</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4 font-mono text-xs">_gcl_au</td>
                        <td className="py-2 pr-4">Used by Google Ads to track conversions</td>
                        <td className="py-2">3 months</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4 font-mono text-xs">sb_utm</td>
                        <td className="py-2 pr-4">Tracks campaign source and attribution data</td>
                        <td className="py-2">6 months</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* How We Use Cookies */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-stone-600" />
              </div>
              <h2 className="text-2xl font-bold text-stone-900">3. How We Use Cookies</h2>
            </div>
            <div className="text-stone-600 space-y-3 leading-relaxed">
              <p>We use cookies for the following specific purposes:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Authentication and Security:</strong> To verify your identity, maintain your logged-in session, protect against CSRF attacks, and implement multi-factor authentication.</li>
                <li><strong>Platform Functionality:</strong> To remember your preferences, customize your dashboard layout, save your recent project views, and provide a personalized user experience across sessions.</li>
                <li><strong>Analytics and Performance:</strong> To understand how users interact with our platform, identify popular features, detect performance bottlenecks, and make data-driven improvements to our services.</li>
                <li><strong>Error Reporting:</strong> To capture and report JavaScript errors, API failures, and other technical issues that help us maintain platform stability and reliability.</li>
                <li><strong>Marketing and Advertising:</strong> To measure the effectiveness of our marketing campaigns, retarget website visitors with relevant advertisements, and understand the customer journey from ad click to signup.</li>
              </ul>
            </div>
          </div>

          {/* Managing Cookies */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center">
                <Settings className="w-5 h-5 text-stone-600" />
              </div>
              <h2 className="text-2xl font-bold text-stone-900">4. Managing Your Cookie Preferences</h2>
            </div>
            <div className="text-stone-600 space-y-3 leading-relaxed">
              <p>
                When you first visit our website, you will be presented with a cookie consent banner that allows you to accept or customize your cookie preferences. You can update your preferences at any time through the following methods:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Cookie Preference Center:</strong> Click the cookie settings icon in the footer of any page to access our cookie preference center, where you can enable or disable specific categories of cookies.</li>
                <li><strong>Browser Settings:</strong> Most web browsers allow you to control cookies through their settings. You can set your browser to refuse all cookies, accept only first-party cookies, or delete cookies when you close your browser. Consult your browser&apos;s help documentation for specific instructions.</li>
                <li><strong>Opt-Out Links:</strong> You can opt out of Google Analytics tracking by installing the{' '}
                  <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:text-emerald-700 underline">
                    Google Analytics Opt-out Browser Add-on
                  </a>. For third-party advertising cookies, you can visit the{' '}
                  <a href="https://optout.networkadvertising.org/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:text-emerald-700 underline">
                    Network Advertising Initiative opt-out page
                  </a> or the{' '}
                  <a href="https://optout.aboutads.info/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:text-emerald-700 underline">
                    Digital Advertising Alliance opt-out page
                  </a>.
                </li>
              </ul>
              <p className="font-medium text-stone-700">
                Please note that disabling certain cookies may affect the functionality of our website and platform. Strictly necessary cookies cannot be disabled as they are essential for the operation of our Services.
              </p>
            </div>
          </div>

          {/* Third-Party Cookies */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center">
                <Globe className="w-5 h-5 text-stone-600" />
              </div>
              <h2 className="text-2xl font-bold text-stone-900">5. Third-Party Cookies</h2>
            </div>
            <div className="text-stone-600 space-y-3 leading-relaxed">
              <p>
                In addition to our own cookies, we may use cookies from the following categories of third-party services:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Analytics Services:</strong> Google Analytics (Google LLC) — used to collect and analyze website traffic data. Google&apos;s privacy practices are governed by their{' '}
                  <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:text-emerald-700 underline">Privacy Policy</a>.
                </li>
                <li><strong>Advertising Platforms:</strong> Google Ads, Meta (Facebook) Ads, LinkedIn Ads — used for campaign tracking, conversion measurement, and ad retargeting. Each platform has its own cookie and privacy policies.</li>
                <li><strong>Payment Processors:</strong> Stripe, Inc. — used to process online payments securely. Stripe uses cookies in accordance with their{' '}
                  <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:text-emerald-700 underline">Privacy Policy</a>.
                </li>
                <li><strong>Communication Tools:</strong> Intercom, Inc. — used for live chat and customer support messaging. Intercom uses cookies as described in their privacy documentation.</li>
              </ul>
              <p>
                We do not control the cookie practices of these third-party services, and we encourage you to review their respective privacy and cookie policies for detailed information about their data collection and usage practices.
              </p>
            </div>
          </div>

          {/* Changes to Policy */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-stone-600" />
              </div>
              <h2 className="text-2xl font-bold text-stone-900">6. Changes to This Cookie Policy</h2>
            </div>
            <div className="text-stone-600 space-y-3 leading-relaxed">
              <p>
                We may update this Cookie Policy from time to time to reflect changes in the cookies we use, changes in technology, or for other operational, legal, or regulatory reasons. When we make changes, we will update the &quot;Last updated&quot; date at the top of this page and, for material changes, provide a more prominent notice such as a new cookie consent prompt.
              </p>
              <p>
                We recommend reviewing this Cookie Policy periodically to stay informed about our use of cookies and related technologies.
              </p>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-stone-50 rounded-2xl p-8 mt-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Mail className="w-5 h-5 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-stone-900">7. Contact Us</h2>
            </div>
            <div className="text-stone-600 space-y-3 leading-relaxed">
              <p>
                If you have any questions about our use of cookies or this Cookie Policy, please contact us:
              </p>
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
              </div>
            </div>
          </div>

          {/* Related Links */}
          <div className="flex flex-wrap gap-4 pt-4 border-t border-stone-200">
            <Link href="/privacy-policy" className="text-emerald-600 hover:text-emerald-700 font-medium underline">Privacy Policy</Link>
            <Link href="/terms-of-service" className="text-emerald-600 hover:text-emerald-700 font-medium underline">Terms of Service</Link>
          </div>
        </div>
      </section>
    </div>
  )
}