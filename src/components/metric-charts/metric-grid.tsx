import { KpiCard } from '@/components/confidence'
import { EmptyState } from '@/components/layout/empty-state'
import { getMetricContext } from '@/lib/data/metric-context'

interface MetricGridProps {
  ids: string[]
  // 지표 페이지 안에서는 자기 페이지로 링크하지 않음
  linkToPage?: boolean
}

// 지표 카드 묶음 - 페이지 데이터의 metricIds 순서대로 표시
export async function MetricGrid({ ids, linkToPage = false }: MetricGridProps) {
  const ctx = await getMetricContext()
  const metrics = ctx.pick(ids)
  if (metrics.length === 0)
    return <EmptyState message="표시할 지표가 없습니다." />

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {metrics.map(metric => (
        <KpiCard
          key={metric.id}
          metric={metric}
          sources={ctx.sourcesOf(metric.sourceIds)}
          href={linkToPage ? ctx.hrefs.get(metric.id) : undefined}
        />
      ))}
    </div>
  )
}
