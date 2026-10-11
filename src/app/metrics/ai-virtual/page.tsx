import type { Metadata } from 'next'
import { Container } from '@/components/layout/container'
import { PageHeader } from '@/components/layout/page-header'
import { PageSection } from '@/components/layout/page-section'
import { RelatedNarratives } from '@/components/narratives/related-narratives'
import { MetricGrid } from '@/components/metric-charts/metric-grid'
import { VirtualCaseCards } from '@/components/metric-charts/virtual-case-cards'
import { VirtualMarketPathChart } from '@/components/metric-charts/virtual-market-path-chart'
import { getAiVirtualData } from '@/lib/data'
import { getMetricPage } from '@/lib/navigation'

const page = getMetricPage('/metrics/ai-virtual')

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
}

// AI·버추얼 (F009) - 초기 단계인 버추얼·AI 아이돌 시장과 성숙한 팬덤 플랫폼
export default async function AiVirtualPage() {
  const aiVirtual = await getAiVirtualData()

  return (
    <>
      <PageHeader
        eyebrow="지표"
        title={page.title}
        description={page.description}
      />
      <Container className="space-y-12 pb-16">
        <PageSection
          title="버추얼 아이돌 시장"
          description="매출 비중은 아직 작지만 연 16.82% 성장이 전망됩니다."
        >
          <MetricGrid ids={aiVirtual.metricIds} />
          <VirtualMarketPathChart />
        </PageSection>
        <PageSection
          title="팬덤 플랫폼"
          description="Weverse·Bubble 같은 팬덤 플랫폼은 이미 안정적인 수익원입니다."
        >
          <MetricGrid ids={aiVirtual.platformMetricIds} />
        </PageSection>
        <PageSection title="버추얼·AI 그룹 사례">
          <VirtualCaseCards />
        </PageSection>
        <RelatedNarratives href={page.href} />
      </Container>
    </>
  )
}
