import type { Metadata } from 'next'
import { DiscrepancyNotice } from '@/components/confidence/discrepancy-notice'
import { FinanceExplorer } from '@/components/finance/finance-explorer'
import { Container } from '@/components/layout/container'
import { PageHeader } from '@/components/layout/page-header'
import { PageSection } from '@/components/layout/page-section'
import { RelatedNarratives } from '@/components/narratives/related-narratives'
import { Big4RevenueChart } from '@/components/metric-charts/big4-revenue-chart'
import { MetricGrid } from '@/components/metric-charts/metric-grid'
import { QuarterlyRevenueChart } from '@/components/metric-charts/quarterly-revenue-chart'
import { getDiscrepancies, getFinanceData } from '@/lib/data'
import { getMetricContext } from '@/lib/data/metric-context'
import { getMetricPage } from '@/lib/navigation'

const page = getMetricPage('/metrics/finance')

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
}

// 기획사 재무 (F005) - 상장 기획사 실적·수익성 비교 (DART 원자료 기준)
export default async function FinancePage() {
  const [finance, discrepancies, ctx] = await Promise.all([
    getFinanceData(),
    getDiscrepancies(),
    getMetricContext(),
  ])
  // 연간 재무가 있는 회사만 비교 대상 (중소 상장사는 규모 차이가 커 기본은 숨김)
  const listed = finance.companies.filter(company =>
    finance.financials.some(row => row.company === company.name)
  )
  const annual = finance.financials
  const pageMetricIds = new Set(finance.metricIds)
  const notices = discrepancies.filter(item => pageMetricIds.has(item.metricId))

  return (
    <>
      <PageHeader
        eyebrow="지표"
        title={page.title}
        description={page.description}
      />
      <Container className="space-y-12 pb-16">
        <PageSection
          title="재무 핵심 지표"
          description="상장 4사(하이브·SM·YG·JYP) 연결 기준"
        >
          <MetricGrid ids={finance.metricIds} />
          {notices.map(item => {
            const metric = ctx.byId.get(item.metricId)
            return metric ? (
              <DiscrepancyNotice
                key={item.metricId}
                discrepancy={item}
                metric={metric}
                sources={ctx.sources}
              />
            ) : null
          })}
        </PageSection>
        <PageSection
          title="회사별 실적 비교"
          description="회사·연도를 눌러 비교 대상을 고르세요. 처음에는 상장 4사만 표시하며, 중소 상장사(FNC·큐브·RBW·TN)는 회사 칩을 눌러 추가합니다."
        >
          <FinanceExplorer
            companies={listed.map(company => company.name)}
            defaultHidden={listed
              .filter(company => company.tier === 'mid')
              .map(company => company.name)}
            financials={annual}
            sources={ctx.sourcesOf([
              ...new Set(annual.flatMap(row => row.sourceIds)),
            ])}
          />
        </PageSection>
        <PageSection
          title="규모 격차"
          description="합산 실적은 늘었지만 대형과 중소 기획사의 매출 규모 차이는 극단적입니다."
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <Big4RevenueChart />
            <QuarterlyRevenueChart />
          </div>
        </PageSection>
        <RelatedNarratives href={page.href} />
      </Container>
    </>
  )
}
