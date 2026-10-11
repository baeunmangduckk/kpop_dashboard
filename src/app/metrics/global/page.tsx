import type { Metadata } from 'next'
import { Container } from '@/components/layout/container'
import { PageHeader } from '@/components/layout/page-header'
import { PageSection } from '@/components/layout/page-section'
import { RelatedNarratives } from '@/components/narratives/related-narratives'
import { MetricGrid } from '@/components/metric-charts/metric-grid'
import { PromisingRegions } from '@/components/metric-charts/promising-regions'
import { RegionExportsChart } from '@/components/metric-charts/region-exports-chart'
import { getGlobalData } from '@/lib/data'
import { getMetricPage } from '@/lib/navigation'

const page = getMetricPage('/metrics/global')

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
}

// 글로벌 확장 (F007) - 중화권·일본 축소와 북미·신흥시장 부상
export default async function GlobalPage() {
  const global = await getGlobalData()

  return (
    <>
      <PageHeader
        eyebrow="지표"
        title={page.title}
        description={page.description}
      />
      <Container className="space-y-12 pb-16">
        <PageSection
          title="지역 축 핵심 지표"
          description="기존 핵심 시장이 줄고 북미·중남미가 그 자리를 채우고 있습니다."
        >
          <MetricGrid ids={global.metricIds} />
        </PageSection>
        <PageSection title="지역별 변화와 유망 권역">
          <div className="grid gap-4 lg:grid-cols-2">
            <RegionExportsChart />
            <PromisingRegions />
          </div>
        </PageSection>
        <RelatedNarratives href={page.href} />
      </Container>
    </>
  )
}
