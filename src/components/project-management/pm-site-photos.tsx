'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Camera, Calendar, Image, Tag, Images } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const kpiItems = [
  { label: 'Total Photos', value: '0', description: 'All site photos', icon: Camera },
  { label: 'This Week', value: '0', description: 'Photos uploaded this week', icon: Calendar },
  { label: 'Albums', value: '0', description: 'Photo albums created', icon: Image },
  { label: 'Tagged', value: '0', description: 'Photos with tags', icon: Tag },
]

export function PmSitePhotos() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Site Photos</h1>
          <p className="text-muted-foreground">Organize and manage project site photographs</p>
        </div>
        <Button>Upload Photos</Button>
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
          <CardTitle>Photo Gallery</CardTitle>
          <CardDescription>Browse and manage site photographs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48 border-2 border-dashed rounded-lg">
            <div className="text-center">
              <Images className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">Coming Soon</p>
              <Badge variant="secondary" className="mt-2">Under Development</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}