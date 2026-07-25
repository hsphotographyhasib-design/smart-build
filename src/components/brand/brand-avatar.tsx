import Image from 'next/image'
import { cn } from '@/lib/utils'

interface BrandAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function BrandAvatar({ size = 'md', className }: BrandAvatarProps) {
  const sizeMap = { sm: 24, md: 32, lg: 40, xl: 56 }
  const px = sizeMap[size]
  return (
    <div className={cn('overflow-hidden rounded-full', className)} style={{ width: px, height: px }}>
      <Image src='/brand/smartbuild-circle.svg' alt='SmartBuild' width={px} height={px} className='h-full w-full object-cover' />
    </div>
  )
}
