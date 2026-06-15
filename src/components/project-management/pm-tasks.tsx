'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { CheckSquare, Play, AlertTriangle, CheckCircle, ListTodo } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const kpiItems = [
  { label: 'Total Tasks', value: '0', description: 'All project tasks', icon: CheckSquare },
  { label: 'In Progress', value: '0', description: 'Currently in progress', icon: Play },
  { label: 'Overdue', value: '0', description: 'Past due tasks', icon: AlertTriangle },
  { label: 'Completed', value: '0', description: 'Finished tasks', icon: CheckCircle },
]

export function PmTasks() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Project Tasks</h1>
          <p className="text-muted-foreground">Track and manage all project tasks</p>
        </div>
        <Button>Add Task</Button>
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
          <CardTitle>Task Board</CardTitle>
          <CardDescription>Kanban-style task management view</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48 border-2 border-dashed rounded-lg">
            <div className="text-center">
              <ListTodo className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">Coming Soon</p>
              <Badge variant="secondary" className="mt-2">Under Development</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}