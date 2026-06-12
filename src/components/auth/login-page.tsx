'use client'

import { useAppStore, api } from '@/lib/store'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useState } from 'react'
import { HardHat, Eye, EyeOff, Loader2, Building2, Shield, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required').min(6, 'Password must be at least 6 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { setToken, setUser, navigate } = useAppStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true)
    try {
      const res = await api.post('/api/auth/login', data)

      if (res.success && res.data) {
        setToken(res.data.token)
        setUser(res.data.user)
        toast.success('Welcome back!', {
          description: `Logged in as ${res.data.user?.name || res.data.user?.email}`,
        })
        navigate('dashboard')
      } else {
        toast.error('Login failed', {
          description: res.error || 'Invalid email or password',
        })
      }
    } catch {
      toast.error('Login failed', {
        description: 'An unexpected error occurred. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8"
      style={{
        background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 25%, #fde68a 50%, #fcd34d 75%, #f59e0b 100%)',
      }}
    >
      {/* Subtle construction pattern overlay */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23924' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <Card className="w-full max-w-5xl overflow-hidden border-0 shadow-2xl relative">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left: Brand Area */}
          <div
            className="relative flex flex-col items-center justify-center p-8 md:p-12 lg:p-16 text-white"
            style={{
              background: 'linear-gradient(160deg, #b45309 0%, #d97706 40%, #f59e0b 100%)',
            }}
          >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="absolute top-1/4 left-6 w-2 h-16 bg-white/20 rounded-full" />
            <div className="absolute bottom-1/4 right-8 w-2 h-20 bg-white/20 rounded-full" />

            <div className="relative z-10 text-center space-y-6">
              {/* Logo Icon */}
              <div className="mx-auto w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg border border-white/30">
                <HardHat className="w-12 h-12 text-white" strokeWidth={1.5} />
              </div>

              {/* Company Name */}
              <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                  SMARTBUILD
                </h1>
                <div className="w-16 h-1 bg-white/60 mx-auto rounded-full" />
                <p className="text-white/90 text-sm md:text-base font-medium tracking-wide">
                  Construction Management ERP
                </p>
              </div>

              {/* Feature highlights */}
              <div className="pt-6 space-y-4 text-left max-w-xs mx-auto">
                <div className="flex items-center gap-3 text-white/90">
                  <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <span className="text-sm">Project & Site Management</span>
                </div>
                <div className="flex items-center gap-3 text-white/90">
                  <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center shrink-0">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <span className="text-sm">Financial Tracking & Reports</span>
                </div>
                <div className="flex items-center gap-3 text-white/90">
                  <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center shrink-0">
                    <Shield className="w-4 h-4" />
                  </div>
                  <span className="text-sm">Secure Role-Based Access</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Login Form */}
          <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-white">
            <div className="space-y-8 max-w-sm mx-auto w-full">
              {/* Form Header */}
              <div className="space-y-2 text-center md:text-left">
                <h2 className="text-2xl md:text-3xl font-bold text-stone-900">
                  Welcome back
                </h2>
                <p className="text-stone-500 text-sm">
                  Sign in to your account to continue
                </p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-stone-700 text-sm font-medium">
                    Email address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@smartbuild.com"
                    autoComplete="email"
                    disabled={isSubmitting}
                    className={`h-11 bg-stone-50 border-stone-200 focus:bg-white transition-colors ${
                      errors.email ? 'border-red-400 focus-visible:ring-red-200' : 'focus-visible:ring-amber-200 focus-visible:border-amber-500'
                    }`}
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-stone-700 text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      disabled={isSubmitting}
                      className={`h-11 bg-stone-50 border-stone-200 focus:bg-white transition-colors pr-11 ${
                        errors.password ? 'border-red-400 focus-visible:ring-red-200' : 'focus-visible:ring-amber-200 focus-visible:border-amber-500'
                      }`}
                      {...register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                      tabIndex={-1}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-semibold transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Signing in...
                    </span>
                  ) : (
                    'Sign in'
                  )}
                </Button>
              </form>

              {/* Footer info */}
              <div className="pt-2 border-t border-stone-100">
                <p className="text-xs text-stone-400 text-center">
                  Secure enterprise access only. Contact your administrator for credentials.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}