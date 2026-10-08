import type { Metadata } from 'next'
import { PageHeader } from '@/components/layout/page-header'
import { PagePlaceholder } from '@/components/layout/page-placeholder'
import { getMarketData } from '@/lib/data'
import { getMetricPage } from '@/lib/navigation'

const page = getMetricPage('/metrics/market')

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
}

export default async function MarketPage() {
  const data = await getMarketData()

  return (
    <>
      <PageHeader
        eyebrow="지표"
        title={page.title}
        description={page.description}
      />
      <PagePlaceholder
        detail={`지표 ${data.metricIds.length}개 · 수출 시계열 ${data.albumExports.points.length}개 연도 · 전망 ${data.eventForecasts.rows.length}건 로드됨`}
      />
    </>
  )
}
