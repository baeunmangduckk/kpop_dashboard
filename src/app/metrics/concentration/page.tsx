import type { Metadata } from 'next'
import { SignalList } from '@/components/insights/signal-list'
import { Container } from '@/components/layout/container'
import { PageHeader } from '@/components/layout/page-header'
import { PageSection } from '@/components/layout/page-section'
import { CapitalGapTable } from '@/components/metric-charts/capital-gap-table'
import { GiniTrendChart } from '@/components/metric-charts/gini-trend-chart'
import { MetricGrid } from '@/components/metric-charts/metric-grid'
import { SalesTierChart } from '@/components/metric-charts/sales-tier-chart'
import { ShareTrendChart } from '@/components/metric-charts/share-trend-chart'
import { SurvivalChart } from '@/components/metric-charts/survival-chart'
import { TopVsBottomChart } from '@/components/metric-charts/top-vs-bottom-chart'
import { TotalSalesChart } from '@/components/metric-charts/total-sales-chart'
import { getConcentrationData, getSources } from '@/lib/data'
import { getMetricPage } from '@/lib/navigation'

const page = getMetricPage('/metrics/concentration')

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
}

// 판매 집중도 (F004) - 판매 분산과 자본·인프라 격차
export default async function ConcentrationPage() {
  const [concentration, sources] = await Promise.all([
    getConcentrationData(),
    getSources(),
  ])

  return (
    <>
      <PageHeader
        eyebrow="지표"
        title={page.title}
        description={page.description}
      />
      <Container className="space-y-12 pb-16">
        <PageSection
          title="집중도 핵심 지표"
          description="판매 집중도는 낮아졌지만 총 판매량과 그룹 생존율은 여전히 낮습니다."
        >
          <MetricGrid ids={concentration.metricIds} />
        </PageSection>
        <PageSection
          title="판매는 분산되는 중"
          description="Top10 점유율과 Gini 모두 관측 기간 최저 수준입니다."
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <ShareTrendChart />
            <GiniTrendChart />
            <TopVsBottomChart />
            <TotalSalesChart />
          </div>
        </PageSection>
        <PageSection
          title="자본·생존 격차는 여전"
          description="판매 분산이 곧 기획사 간 기회 균등을 뜻하지는 않습니다."
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <CapitalGapTable />
            <SurvivalChart />
            <SalesTierChart />
          </div>
        </PageSection>
        <PageSection title="지속가능성 리스크·기회 신호">
          <SignalList signals={concentration.signals} sources={sources} />
        </PageSection>
      </Container>
    </>
  )
}
