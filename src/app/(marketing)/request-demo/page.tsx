'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useFormat } from '@/hooks/use-format'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  User,
  Building2,
  CalendarDays,
  Loader2,
} from 'lucide-react'

const POSITION_OPTIONS = [
  'CEO',
  'Project Manager',
  'Site Engineer',
  'Finance Manager',
  'HR Manager',
  'Other',
]

const INDUSTRY_OPTIONS = [
  'Construction',
  'HVAC',
  'Electrical',
  'Facility Management',
  'MEP',
  'Property Management',
  'Government',
  'Other',
]

const EMPLOYEE_COUNT_OPTIONS = ['1-10', '11-50', '51-200', '201-500', '500+']

const CURRENT_TOOLS_OPTIONS = ['Spreadsheets', 'Other Software', 'None']

const TIME_OPTIONS = ['9:00 AM', '11:00 AM', '2:00 PM', '4:00 PM']

const REFERRAL_OPTIONS = ['Google', 'Referral', 'Social Media', 'Trade Show', 'Other']

const TIMEZONE_OPTIONS = [
  'UTC',
  'US/Eastern (EST)',
  'US/Central (CST)',
  'US/Mountain (MST)',
  'US/Pacific (PST)',
  'Europe/London (GMT)',
  'Europe/Berlin (CET)',
  'Asia/Dubai (GST)',
  'Asia/Kolkata (IST)',
  'Asia/Singapore (SGT)',
  'Asia/Tokyo (JST)',
  'Australia/Sydney (AEST)',
]

function detectTimezone(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    const match = TIMEZONE_OPTIONS.find((t) =>
      tz.includes(t.split(' ')[0].split('/')[1]?.toLowerCase() || '')
    )
    return match || tz
  } catch {
    return 'UTC'
  }
}

export default function RequestDemoPage() {
  const { getPhonePlaceholder, getCountryName } = useFormat()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    country: '',
    industry: '',
    employeeCount: '',
    currentTools: [] as string[],
    requirements: '',
    preferredDate: '',
    preferredTime: '',
    timezone: detectTimezone(),
    referralSource: '',
  })

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setError('')
  }

  const toggleTool = (tool: string) => {
    setForm((prev) => ({
      ...prev,
      currentTools: prev.currentTools.includes(tool)
        ? prev.currentTools.filter((t) => t !== tool)
        : [...prev.currentTools, tool],
    }))
  }

  const validateStep = (): boolean => {
    if (step === 1) {
      if (!form.fullName.trim()) {
        setError('Full name is required')
        return false
      }
      if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        setError('A valid email is required')
        return false
      }
    }
    return true
  }

  const nextStep = () => {
    if (validateStep()) {
      setStep((s) => Math.min(s + 1, 3))
    }
  }

  const prevStep = () => {
    setStep((s) => Math.max(s - 1, 1))
    setError('')
  }

  const handleSubmit = async () => {
    if (!validateStep()) return
    setIsSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/demo-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (data.success) {
        setIsSuccess(true)
      } else {
        setError(data.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-md space-y-6">
          <div className="mx-auto w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-amber-600 dark:text-amber-400" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Thank You!</h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            We&apos;ll contact you within 24 hours to schedule your demo.
          </p>
          <Button asChild className="bg-amber-600 hover:bg-amber-700 text-white">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-16 sm:py-24">
      {/* Hero */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
          See SmartBuild{' '}
          <span className="text-amber-600 dark:text-amber-400">in Action</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Book a personalized demo and discover how SmartBuild can transform
          your construction operations
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="max-w-2xl mx-auto mb-10">
        <div className="flex items-center justify-center gap-2 sm:gap-4">
          {[
            { num: 1, label: 'About You', icon: User },
            { num: 2, label: 'Your Needs', icon: Building2 },
            { num: 3, label: 'Schedule', icon: CalendarDays },
          ].map((s, i) => (
            <div key={s.num} className="flex items-center gap-2 sm:gap-4">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 text-sm font-semibold transition-colors ${
                    step >= s.num
                      ? 'border-amber-500 bg-amber-500 text-white'
                      : 'border-muted-foreground/30 text-muted-foreground'
                  }`}
                >
                  {step > s.num ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    s.num
                  )}
                </div>
                <span
                  className={`text-xs font-medium hidden sm:block ${
                    step >= s.num
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-muted-foreground'
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < 2 && (
                <div
                  className={`w-16 sm:w-24 h-0.5 rounded-full transition-colors ${
                    step > s.num
                      ? 'bg-amber-500'
                      : 'bg-muted-foreground/20'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Card */}
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-6 sm:p-8">
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Step 1: About You */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-xl font-semibold mb-6">About You</h2>

              <div className="space-y-2">
                <Label htmlFor="fullName">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  placeholder="John Doe"
                  value={form.fullName}
                  onChange={(e) => updateField('fullName', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@company.com"
                  value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder={getPhonePlaceholder()}
                  value={form.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company Name</Label>
                <Input
                  id="company"
                  placeholder="Acme Construction Inc."
                  value={form.company}
                  onChange={(e) => updateField('company', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Position / Role</Label>
                <Select
                  value={form.position}
                  onValueChange={(val) => updateField('position', val)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select your position" />
                  </SelectTrigger>
                  <SelectContent>
                    {POSITION_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 2: Your Needs */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-xl font-semibold mb-6">Your Needs</h2>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  placeholder={getCountryName()}
                  value={form.country}
                  onChange={(e) => updateField('country', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Industry</Label>
                <Select
                  value={form.industry}
                  onValueChange={(val) => updateField('industry', val)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRY_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Number of Employees</Label>
                <Select
                  value={form.employeeCount}
                  onValueChange={(val) => updateField('employeeCount', val)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select employee count" />
                  </SelectTrigger>
                  <SelectContent>
                    {EMPLOYEE_COUNT_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Current Tools</Label>
                <div className="space-y-3 mt-2">
                  {CURRENT_TOOLS_OPTIONS.map((tool) => (
                    <label
                      key={tool}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <Checkbox
                        checked={form.currentTools.includes(tool)}
                        onCheckedChange={() => toggleTool(tool)}
                        className="data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
                      />
                      <span className="text-sm group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {tool}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="requirements">Requirements</Label>
                <Textarea
                  id="requirements"
                  placeholder="Tell us about your specific needs..."
                  rows={4}
                  value={form.requirements}
                  onChange={(e) => updateField('requirements', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Step 3: Schedule */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-xl font-semibold mb-6">Schedule Your Demo</h2>

              <div className="space-y-2">
                <Label htmlFor="preferredDate">Preferred Demo Date</Label>
                <Input
                  id="preferredDate"
                  type="date"
                  value={form.preferredDate}
                  onChange={(e) => updateField('preferredDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="space-y-2">
                <Label>Preferred Time</Label>
                <Select
                  value={form.preferredTime}
                  onValueChange={(val) => updateField('preferredTime', val)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Timezone</Label>
                <Select
                  value={form.timezone}
                  onValueChange={(val) => updateField('timezone', val)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONE_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>How did you hear about us?</Label>
                <Select
                  value={form.referralSource}
                  onValueChange={(val) => updateField('referralSource', val)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    {REFERRAL_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            {step > 1 ? (
              <Button variant="outline" onClick={prevStep} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            ) : (
              <div />
            )}

            <span className="text-sm text-muted-foreground">
              Step {step} of 3
            </span>

            {step < 3 ? (
              <Button
                onClick={nextStep}
                className="gap-2 bg-amber-600 hover:bg-amber-700 text-white"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="gap-2 bg-amber-600 hover:bg-amber-700 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Request'
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}