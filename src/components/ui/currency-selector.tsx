'use client'

import { useEffect, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Globe } from 'lucide-react'

interface CurrencyOption {
  code: string
  name: string
  symbolNative: string
}

interface CurrencySelectorProps {
  value?: string
  onValueChange?: (code: string) => void
  className?: string
}

export function CurrencySelector({ value, onValueChange, className }: CurrencySelectorProps) {
  const [currencies, setCurrencies] = useState<CurrencyOption[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCurrencies() {
      try {
        const res = await fetch('/api/regional/currencies')
        if (res.ok) {
          const json = await res.json()
          setCurrencies(json.data.currencies)
        }
      } catch (error) {
        console.error('Failed to fetch currencies:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchCurrencies()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading currencies...
      </div>
    )
  }

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className}>
        <Globe className="w-4 h-4 mr-2 text-muted-foreground" />
        <SelectValue placeholder="Select currency" />
      </SelectTrigger>
      <SelectContent>
        {currencies.map((c) => (
          <SelectItem key={c.code} value={c.code}>
            <span className="flex items-center gap-2">
              <span className="font-medium text-foreground">{c.symbolNative}</span>
              <span className="text-muted-foreground">{c.code}</span>
              <span className="text-xs text-muted-foreground">— {c.name}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
