'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Building2, User, Moon, Sun, Save, Shield, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export function SettingsPage() {
  const { user, theme, setTheme, navigate } = useAppStore()

  // কোম্পানি তথ্য ফর্ম
  const [companyForm, setCompanyForm] = useState({
    name: 'SmartBuild Constructions Pvt. Ltd.',
    address: '123, Construction Lane, Bangalore, Karnataka 560001',
    phone: '+91 98765 43210',
    email: 'info@smartbuild.in',
  })

  // প্রোফাইল ফর্ম
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    currentPassword: '',
    newPassword: '',
  })

  const handleSaveCompany = () => {
    toast.success('Settings saved')
  }

  const handleSaveProfile = () => {
    toast.success('Settings saved')
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
    toast.success(`Switched to ${theme === 'dark' ? 'light' : 'dark'} mode`)
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account and application preferences</p>
      </div>

      {/* Theme Toggle */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            {theme === 'dark' ? <Moon className="h-5 w-5 text-amber-500" /> : <Sun className="h-5 w-5 text-amber-600" />}
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Theme</p>
              <p className="text-sm text-muted-foreground">Toggle between light and dark mode</p>
            </div>
            <Button variant="outline" onClick={toggleTheme} className="gap-2">
              {theme === 'dark' ? (
                <>
                  <Sun className="h-4 w-4" />
                  Light Mode
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4" />
                  Dark Mode
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Company Info */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-5 w-5 text-amber-600" />
            Company Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Company Name</Label>
            <Input
              value={companyForm.name}
              onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Address</Label>
            <Input
              value={companyForm.address}
              onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={companyForm.phone}
                onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={companyForm.email}
                onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
              />
            </div>
          </div>
          <div className="pt-2">
            <Button onClick={handleSaveCompany} className="bg-amber-600 hover:bg-amber-700 text-white">
              <Save className="h-4 w-4 mr-2" />
              Save Company Info
            </Button>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* User Profile */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-5 w-5 text-amber-600" />
            User Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input
              value={profileForm.phone}
              onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              placeholder="Phone number"
            />
          </div>

          <Separator />

          <p className="text-sm font-medium text-muted-foreground">Change Password</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Current Password</Label>
              <Input
                type="password"
                value={profileForm.currentPassword}
                onChange={(e) => setProfileForm({ ...profileForm, currentPassword: e.target.value })}
                placeholder="Enter current password"
              />
            </div>
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input
                type="password"
                value={profileForm.newPassword}
                onChange={(e) => setProfileForm({ ...profileForm, newPassword: e.target.value })}
                placeholder="Enter new password"
              />
            </div>
          </div>
          <div className="pt-2">
            <Button onClick={handleSaveProfile} className="bg-amber-600 hover:bg-amber-700 text-white">
              <Save className="h-4 w-4 mr-2" />
              Save Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Admin Section */}
      {user?.role === 'admin' || user?.role === 'super_admin' ? (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-5 w-5 text-amber-600" />
              Administration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <button
                onClick={() => navigate('feature-updates')}
                className="w-full flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-600 p-2">
                    <Shield className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">Feature Management</p>
                    <p className="text-xs text-muted-foreground">Control modules, feature flags & versioning</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}