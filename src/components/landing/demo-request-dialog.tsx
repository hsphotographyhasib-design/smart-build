'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Building2,
  User,
  Mail,
  Phone,
  Briefcase,
  Globe,
  Loader2,
  CheckCircle2,
  MessageSquare,
  MapPin,
  Users,
  ChevronDown,
} from 'lucide-react'
import { useRegion } from '@/components/providers/regional-provider'
import { useFormat } from '@/hooks/use-format'
import { getAllCountries } from '@/lib/regional/regional-config'

interface DemoRequestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const industries = [
  'Construction',
  'Facility Management',
  'Maintenance Services',
  'Property Development',
  'Infrastructure',
  'MEP Contracting',
  'Architecture',
  'Real Estate',
  'Government',
  'Other',
]

const teamSizes = [
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '500+',
]

export function DemoRequestDialog({ open, onOpenChange }: DemoRequestDialogProps) {
  const { country, isLoaded, changeCountry } = useRegion()
  const { getPhonePlaceholder, getCurrencyCode } = useFormat()
  const countries = getAllCountries()

  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [step, setStep] = useState<'form' | 'success'>('form')
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false)

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    country: '',
    industry: '',
    employeeCount: '',
    requirements: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Auto-fill country, phone placeholder when region is detected
  useEffect(() => {
    if (isLoaded && country && !formData.country) {
      setFormData((prev) => ({
        ...prev,
        country: country.code,
      }))
    }
  }, [isLoaded, country, formData.country])

  const updateField = useCallback((field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }, [errors])

  // Handle country selection change
  const handleCountryChange = useCallback(async (countryCode: string) => {
    updateField('country', countryCode)
    // Also update the global region
    await changeCountry(countryCode)
    setCountryDropdownOpen(false)
  }, [updateField, changeCountry])

  // Get current phone placeholder based on selected country
  const currentPhonePlaceholder = (() => {
    if (formData.country) {
      const c = countries.find(c => c.code === formData.country)
      return c?.phonePlaceholder ?? getPhonePlaceholder()
    }
    return getPhonePlaceholder()
  })()

  const selectedCountryLabel = (() => {
    if (!formData.country) return ''
    const c = countries.find(c => c.code === formData.country)
    return c ? `${c.flagEmoji} ${c.name}` : formData.country
  })()

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.fullName.trim()) newErrors.fullName = 'Name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      // Get timezone from browser
      let timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || ''

      const res = await fetch('/api/demo-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, timezone, currency: getCurrencyCode() }),
      })

      if (res.ok) {
        setStep('success')
        setSubmitted(true)
      } else {
        const data = await res.json()
        if (data.error) {
          setErrors({ submit: data.error })
        }
      }
    } catch {
      setErrors({ submit: 'Something went wrong. Please try again.' })
    } finally {
      setLoading(false)
    }
  }, [formData, validate, getCurrencyCode])

  const handleClose = useCallback((isOpen: boolean) => {
    onOpenChange(isOpen)
    if (!isOpen) {
      // Reset form after a short delay for smooth transition
      setTimeout(() => {
        setFormData({
          fullName: '', email: '', phone: '', company: '',
          position: '', country: '', industry: '',
          employeeCount: '', requirements: '',
        })
        setErrors({})
        setStep('form')
      }, 300)
    }
  }, [onOpenChange])

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 pt-8 pb-6 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">
              {step === 'success' ? '🎉 Request Received!' : 'Request a Demo'}
            </DialogTitle>
            <DialogDescription className="text-orange-100 mt-1">
              {step === 'success'
                ? 'Our team will contact you within 24 hours.'
                : 'See how SmartBuild can transform your operations.'}
            </DialogDescription>
          </DialogHeader>
          {/* Currency indicator */}
          {step !== 'success' && isLoaded && (
            <div className="mt-3 flex items-center gap-2 text-orange-100/80 text-xs">
              <Globe className="w-3 h-3" />
              <span>Pricing shown in {getCurrencyCode()} &middot; {country?.flagEmoji} {country?.name}</span>
            </div>
          )}
        </div>

        {step === 'success' ? (
          <div className="px-6 py-10 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </motion.div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Thank You!</h3>
            <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
              We&apos;ve received your demo request. A SmartBuild specialist will reach out to schedule your personalized demo.
            </p>
            <Button onClick={() => handleClose(false)} className="bg-orange-500 hover:bg-orange-600">
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 pb-6 pt-2">
            <div className="grid gap-4">
              {/* Row 1: Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={(e) => updateField('fullName', e.target.value)}
                    className={errors.fullName ? 'border-red-300 focus-visible:ring-red-300' : ''}
                  />
                  {errors.fullName && <p className="text-xs text-red-500">{errors.fullName}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    Email <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="email"
                    placeholder="john@company.com"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className={errors.email ? 'border-red-300 focus-visible:ring-red-300' : ''}
                  />
                  {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                </div>
              </div>

              {/* Row 2: Phone & Company */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    Phone
                  </label>
                  <Input
                    placeholder={currentPhonePlaceholder}
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-gray-400" />
                    Company
                  </label>
                  <Input
                    placeholder="Company Name"
                    value={formData.company}
                    onChange={(e) => updateField('company', e.target.value)}
                  />
                </div>
              </div>

              {/* Row 3: Position & Country Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                    Position
                  </label>
                  <Input
                    placeholder="Project Manager"
                    value={formData.position}
                    onChange={(e) => updateField('position', e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    Country
                  </label>
                  <Select value={formData.country} onValueChange={handleCountryChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country">
                        {selectedCountryLabel || 'Select country'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((c) => (
                        <SelectItem key={c.code} value={c.code}>
                          <span className="flex items-center gap-2">
                            <span>{c.flagEmoji}</span>
                            <span>{c.name}</span>
                            <span className="text-gray-400 text-xs">({c.defaultCurrencyCode})</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 4: Industry & Team Size */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-gray-400" />
                    Industry
                  </label>
                  <Select value={formData.industry} onValueChange={(v) => updateField('industry', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map((ind) => (
                        <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-gray-400" />
                    Team Size
                  </label>
                  <Select value={formData.employeeCount} onValueChange={(v) => updateField('employeeCount', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      {teamSizes.map((s) => (
                        <SelectItem key={s} value={s}>{s} employees</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Requirements */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
                  How can we help?
                </label>
                <Textarea
                  placeholder="Tell us about your project management challenges..."
                  rows={3}
                  value={formData.requirements}
                  onChange={(e) => updateField('requirements', e.target.value)}
                  className="resize-none"
                />
              </div>

              {/* Error message */}
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded-lg">
                  {errors.submit}
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-lg shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Request Demo'
                )}
              </Button>

              <p className="text-center text-xs text-gray-400">
                No spam. We&apos;ll contact you within 24 hours.
              </p>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
