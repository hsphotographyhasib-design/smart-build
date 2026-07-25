import Image from 'next/image'
import { cn } from '@/lib/utils'

interface CompanySealProps {
  size?: number
  className?: string
  opacity?: number
}

export function CompanySeal({ size = 120, className, opacity = 0.15 }: CompanySealProps) {
  return (
    <div className={cn('pointer-events-none', className)} style={{ opacity }}>
      <Image src='/brand/smartbuild-seal.svg' alt='' width={size} height={size} className='object-contain' />
    </div>
  )
}
