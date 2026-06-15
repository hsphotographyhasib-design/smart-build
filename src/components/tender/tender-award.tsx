'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Trophy, Clock, FileCheck, DollarSign, Award } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const kpiItems = [
  { label: 'Awards', value: '0', description: 'Total awards issued', icon: Trophy },
  { label: 'Pending Approval', value: '0', description: 'Awaiting approval', icon: Clock },
  { label: 'Active Contracts', value: '0', description: 'Currently active', icon: FileCheck },
  { label: 'Total Value', value: '0', description: 'Total award value', icon: DollarSign },
]

export function TenderAward() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Award Management</h1>
          <p className="text-muted-foreground">Manage tender awards and contract issuance</p>
        </div>
        <Button>New Award</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiItems.map((item, i) => {
          const Icon = item.icon
          return (
            <motion.div key={item.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">{item.label}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{item.value}</div>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Award Pipeline</CardTitle>
          <CardDescription>Track awards through the approval process</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48 border-2 border-dashed rounded-lg">
            <div className="text-center">
              <Award className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">Coming Soon</p>
              <Badge variant="secondary" className="mt-2">Under Development</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}