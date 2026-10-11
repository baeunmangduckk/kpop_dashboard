import type { Metadata } from 'next'
import { Container } from '@/components/layout/container'
import { PageHeader } from '@/components/layout/page-header'
import { PageSection } from '@/components/layout/page-section'
import { RelatedNarratives } from '@/components/narratives/related-narratives'
import { AlbumExportGrowthChart } from '@/components/metric-charts/album-export-growth-chart'
import { AlbumExportsChart } from '@/components/metric-charts/album-exports-chart'
import { EventForecastTable } from '@/components/metric-charts/event-forecast-table'
import { MetricGrid } from '@/components/metric-charts/metric-grid'
import { getMarketData } from '@/lib/data'
import { getMetricPage } from '@/lib/navigation'

const page = getMetricPage('/metrics/market')

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
}

// 시장 전망 (F003) - 시장 규모·수출·공연 시장 전망
export default async function MarketPage() {
  const market = await getMarketData()

  return (
    <>
      <PageHeader
        eyebrow="지표"
        title={page.title}
        description={page.description}
      />
      <Container className="space-y-12 pb-16">
        <PageSection
          title="시장 핵심 지표"
          description="글로벌 음반 시장 규모와 한국의 위치"
        >
          <MetricGrid ids={market.metricIds} />
        </PageSection>
        <PageSection
          title="음반·DVD 수출"
          description="수출액은 2023년까지 늘었지만 증가율은 2020년 이후 빠르게 둔화했습니다."
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <AlbumExportsChart />
            <AlbumExportGrowthChart />
          </div>
        </PageSection>
        <PageSection
          title="공연 시장 전망"
          description="조사기관 3곳 모두 연평균 7.5~8.2% 성장을 전망합니다."
        >
          <EventForecastTable />
        </PageSection>
        <RelatedNarratives href={page.href} />
      </Container>
    </>
  )
}
