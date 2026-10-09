import { KpiCard } from '@/components/confidence'
import { getMetricContext } from '@/lib/data/metric-context'

interface MetricGridProps {
  ids: string[]
  // 지표 페이지 안에서는 자기 페이지로 링크하지 않음
  linkToPage?: boolean
}

// 지표 카드 묶음 - 페이지 데이터의 metricIds 순서대로 표시
export async function MetricGrid({ ids, linkToPage = false }: MetricGridProps) {
  const ctx = await getMetricContext()
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {ctx.pick(ids).map(metric => (
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
