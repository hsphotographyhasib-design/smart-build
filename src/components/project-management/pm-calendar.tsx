'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { CalendarDays, Clock, Calendar, AlertCircle, CalendarRange } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const kpiItems = [
  { label: 'Events Today', value: '0', description: "Today's events", icon: CalendarDays },
  { label: 'This Week', value: '0', description: 'Events this week', icon: Clock },
  { label: 'Upcoming', value: '0', description: 'Upcoming events', icon: Calendar },
  { label: 'Deadlines', value: '0', description: 'Approaching deadlines', icon: AlertCircle },
]

export function PmCalendar() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Project Calendar</h1>
          <p className="text-muted-foreground">View and manage project events and deadlines</p>
        </div>
        <Button>Add Event</Button>
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
          <CardTitle>Calendar View</CardTitle>
          <CardDescription>Interactive calendar with project events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48 border-2 border-dashed rounded-lg">
            <div className="text-center">
              <CalendarRange className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">Coming Soon</p>
              <Badge variant="secondary" className="mt-2">Under Development</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}