'use client'

import { useEffect, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, MapPin } from 'lucide-react'

interface CountryOption {
  code: string
  name: string
  flagEmoji: string
  callingCode: string
}

interface CountrySelectorProps {
  value?: string
  onValueChange?: (code: string) => void
  className?: string
}

export function CountrySelector({ value, onValueChange, className }: CountrySelectorProps) {
  const [countries, setCountries] = useState<CountryOption[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCountries() {
      try {
        const res = await fetch('/api/regional/countries')
        if (res.ok) {
          const json = await res.json()
          setCountries(json.data)
        }
      } catch (error) {
        console.error('Failed to fetch countries:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchCountries()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading countries...
      </div>
    )
  }

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className}>
        <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
        <SelectValue placeholder="Select country" />
      </SelectTrigger>
      <SelectContent>
        {countries.map((c) => (
          <SelectItem key={c.code} value={c.code}>
            <span className="flex items-center gap-2">
              <span className="text-base">{c.flagEmoji}</span>
              <span className="font-medium text-foreground">{c.name}</span>
              <span className="text-xs text-muted-foreground">({c.callingCode})</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
