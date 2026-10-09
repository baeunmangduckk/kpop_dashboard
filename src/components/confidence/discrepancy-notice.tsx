import Link from 'next/link'
import { TriangleAlert } from 'lucide-react'
import { formatMetricValue } from '@/lib/format'
import type { Discrepancy, Metric, Source } from '@/lib/schemas'
import { cn } from '@/lib/utils'

interface DiscrepancyNoticeProps {
  discrepancy: Discrepancy
  metric: Metric
  sources: Source[]
  className?: string
}

// 지표 화면의 알려진 불일치 안내 - 채택값·대체값과 출처, 출처·신뢰도 페이지 링크
export function DiscrepancyNotice({
  discrepancy,
  metric,
  sources,
  className,
}: DiscrepancyNoticeProps) {
  const publisher = (id: string) =>
    sources.find(source => source.id === id)?.publisher ?? id

  return (
    <aside
      role="note"
      className={cn(
        'flex gap-3 rounded-xl border border-dashed p-4',
        className
      )}
    >
      <TriangleAlert
        className="text-muted-foreground mt-0.5 size-4 shrink-0"
        aria-hidden
      />
      <div className="space-y-1 text-sm">
        <p className="font-medium">알려진 불일치: {metric.label}</p>
        <p className="text-muted-foreground break-keep">
          채택 {formatMetricValue(discrepancy.adopted.value, metric.unit)}(
          {publisher(discrepancy.adopted.sourceId)}) · 대체{' '}
          {formatMetricValue(discrepancy.alternative.value, metric.unit)}(
          {publisher(discrepancy.alternative.sourceId)})
        </p>
        <Link
          href={`/sources#discrepancy-${discrepancy.metricId}`}
          className="text-primary text-xs font-medium underline-offset-4 hover:underline"
        >
          불일치 내역 보기
        </Link>
      </div>
    </aside>
  )
}
