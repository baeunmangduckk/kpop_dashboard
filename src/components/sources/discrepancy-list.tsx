import Link from 'next/link'
import { EmptyState } from '@/components/layout/empty-state'
import { formatMetricValue } from '@/lib/format'
import type { Discrepancy, Metric, Source } from '@/lib/schemas'
import { getSourceAnchorHref } from '@/lib/sources'

interface DiscrepancyListProps {
  discrepancies: Discrepancy[]
  metrics: Map<string, Metric>
  hrefs: Map<string, string>
  sources: Source[]
}

// 알려진 불일치 목록 - 채택값·대체값과 각 출처, 판단 근거 (/sources#discrepancy-{metricId})
export function DiscrepancyList({
  discrepancies,
  metrics,
  hrefs,
  sources,
}: DiscrepancyListProps) {
  const publisher = (id: string) =>
    sources.find(source => source.id === id)?.publisher ?? id

  if (discrepancies.length === 0)
    return <EmptyState message="현재 알려진 불일치가 없습니다." />

  return (
    <ul className="space-y-3">
      {discrepancies.map(item => {
        const metric = metrics.get(item.metricId)
        const unit = metric?.unit ?? ''
        const href = hrefs.get(item.metricId)
        return (
          <li
            key={item.metricId}
            id={`discrepancy-${item.metricId}`}
            className="bg-card target:ring-ring data-hash-target:ring-ring scroll-mt-24 space-y-3 rounded-xl border p-4 target:ring-2 data-hash-target:ring-2"
          >
            <p className="font-medium">
              {href ? (
                <Link
                  href={href}
                  className="underline-offset-4 hover:underline"
                >
                  {metric?.label ?? item.metricId}
                </Link>
              ) : (
                (metric?.label ?? item.metricId)
              )}
            </p>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              {(
                [
                  ['채택값', item.adopted],
                  ['대체값', item.alternative],
                ] as const
              ).map(([label, value]) => (
                <div key={label} className="bg-muted/40 rounded-lg p-3">
                  <dt className="text-muted-foreground text-xs">{label}</dt>
                  <dd className="font-semibold tabular-nums">
                    {formatMetricValue(value.value, unit)}
                  </dd>
                  <dd className="text-xs">
                    <Link
                      href={getSourceAnchorHref(value.sourceId)}
                      className="text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
                    >
                      {publisher(value.sourceId)}
                    </Link>
                  </dd>
                </div>
              ))}
            </dl>
            <p className="text-muted-foreground text-sm leading-relaxed break-keep">
              {item.note}
            </p>
          </li>
        )
      })}
    </ul>
  )
}
