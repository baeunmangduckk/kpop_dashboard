import { CircleDashed, Gauge, Shuffle, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export type NoticeKind = 'proxy' | 'missing' | 'relative' | 'sample'

const NOTICE = {
  proxy: { label: '프록시 데이터', icon: Shuffle },
  missing: { label: '결측 포함', icon: CircleDashed },
  relative: { label: '상대지수', icon: Gauge },
  sample: { label: '표본', icon: Users },
} satisfies Record<NoticeKind, { label: string; icon: typeof Shuffle }>

interface NoticeBadgeProps {
  kind: NoticeKind
  // 배지 옆 보충 설명 (예: "n=500 · 2026-09-28 수집")
  detail?: string
  className?: string
}

// 데이터 해석 주의 안내 배지 - 프록시·결측·상대지수·표본 여부를 표시
export function NoticeBadge({ kind, detail, className }: NoticeBadgeProps) {
  const { label, icon: Icon } = NOTICE[kind]

  return (
    <span
      data-notice={kind}
      className={cn('inline-flex flex-wrap items-center gap-1.5', className)}
    >
      <Badge variant="outline" className="text-muted-foreground">
        <Icon aria-hidden />
        {label}
      </Badge>
      {detail && (
        <span className="text-muted-foreground text-xs">{detail}</span>
      )}
    </span>
  )
}
