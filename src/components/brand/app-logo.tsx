'use client'

import Image from 'next/image'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

export type LogoVariant = 'primary' | 'app-dark' | 'app-light' | 'circle' | 'seal' | 'icon'
export type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'

const SIZE_MAP: Record<LogoSize, number> = {
  xs: 20,
  sm: 28,
  md: 36,
  lg: 44,
  xl: 56,
  '2xl': 72,
  '3xl': 96,
}

interface AppLogoProps {
  variant?: LogoVariant
  size?: LogoSize
  className?: string
  /** Force a specific theme context instead of auto-detecting */
  themeContext?: 'dark' | 'light'
  /** For the primary logo, show only the icon portion */
  iconOnly?: boolean
}

export function AppLogo({ variant = 'app-dark', size = 'md', className, themeContext, iconOnly }: AppLogoProps) {
  const { resolvedTheme } = useTheme()
  const ctx = themeContext ?? (resolvedTheme === 'dark' ? 'dark' : 'light')
  const px = SIZE_MAP[size]

  let src = '/brand/smartbuild-app-dark.svg'
  if (variant === 'primary') src = '/brand/smartbuild-primary-logo.svg'
  else if (variant === 'circle') src = '/brand/smartbuild-circle.svg'
  else if (variant === 'seal') src = '/brand/smartbuild-seal.svg'
  else if (variant === 'icon') src = '/brand/icon.svg'
  else if (variant === 'app-light') src = '/brand/smartbuild-app-light.svg'
  else if (variant === 'app-dark') src = '/brand/smartbuild-app-dark.svg'
  // Auto-switch: use dark logo on dark bg, light logo on light bg
  else if (variant === 'app-auto' || variant === undefined) {
    src = ctx === 'dark' ? '/brand/smartbuild-app-dark.svg' : '/brand/smartbuild-app-light.svg'
  }

  if (variant === 'primary' && !iconOnly) {
    // Primary logo is wider than tall - use aspect ratio
    return (
      <div className={cn('flex items-center', className)} style={{ height: px * 2 }}>
        <Image
          src={src}
          alt='SmartBuild'
          width={px * 4}
          height={px * 2}
          className='h-full w-auto object-contain'
          priority
        />
      </div>
    )
  }

  return <Image src={src} alt='SmartBuild' width={px} height={px} className={cn('object-contain', className)} priority />
}
