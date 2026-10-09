import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PageSectionProps {
  title: string
  description?: string
  // 제목 오른쪽 보조 링크·필터 자리
  action?: ReactNode
  children: ReactNode
  className?: string
}

// 페이지 안의 소제목 단위 구획 (Container 안에서 사용)
export function PageSection({
  title,
  description,
  action,
  children,
  className,
}: PageSectionProps) {
  return (
    <section className={cn('space-y-4', className)}>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
          {description && (
            <p className="text-muted-foreground text-sm">{description}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}
