import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/layout/empty-state'
import type { Insight } from '@/lib/schemas'
import { cn } from '@/lib/utils'
import { ToneLabel } from './tone-label'

const KIND_LABEL: Record<Insight['kind'], string> = {
  auto: '지표 변화',
  manual: '해석',
}

interface InsightListProps {
  insights: Insight[]
  // 인사이트 id → 근거 지표 페이지 경로
  hrefs: Map<string, string>
  className?: string
}

// 자동(규칙 기반)·수동(큐레이션) 인사이트 목록
export function InsightList({ insights, hrefs, className }: InsightListProps) {
  if (insights.length === 0)
    return <EmptyState message="표시할 인사이트가 없습니다." />

  return (
    <ul className={cn('divide-y', className)}>
      {insights.map(insight => {
        const href = hrefs.get(insight.id)
        return (
          <li
            key={insight.id}
            data-insight-id={insight.id}
            className="space-y-1.5 py-3 first:pt-0 last:pb-0"
          >
            <div className="flex items-center gap-2">
              <ToneLabel tone={insight.tone} />
              <Badge variant="outline" className="text-muted-foreground">
                {KIND_LABEL[insight.kind]}
              </Badge>
            </div>
            <p className="text-sm leading-relaxed break-keep">{insight.text}</p>
            {href && (
              <Link
                href={href}
                className="text-primary inline-flex items-center gap-1 text-xs font-medium underline-offset-4 hover:underline"
              >
                근거 지표 보기
                <ArrowRight className="size-3" aria-hidden />
              </Link>
            )}
          </li>
        )
      })}
    </ul>
  )
}
