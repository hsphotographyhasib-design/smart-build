'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/store'
import { DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react'

export function LoansPage() {
  const { data: loans } = useQuery({
    queryKey: ['loans'],
    queryFn: () => api.get('/api/loans').then(r => r.data?.loans || r.data || []),
  })

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Loan Management</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage employee loans and deductions</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30">
                <DollarSign className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Loans</p>
                <p className="text-2xl font-bold">{Array.isArray(loans) ? loans.length : 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{Array.isArray(loans) ? loans.filter((l: any) => l.status === 'pending').length : 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold">{Array.isArray(loans) ? loans.filter((l: any) => l.status === 'approved').length : 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/30">
                <XCircle className="h-5 w-5 text-rose-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold">{Array.isArray(loans) ? loans.filter((l: any) => l.status === 'rejected').length : 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Loan Records</CardTitle>
        </CardHeader>
        <CardContent>
          {Array.isArray(loans) && loans.length > 0 ? (
            <div className="text-sm text-muted-foreground">
              {loans.length} loan record(s) found. Full loan management table coming soon.
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No loan records found.</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
