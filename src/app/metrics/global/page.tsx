import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Container } from '@/components/layout/container'
import { PageHeader } from '@/components/layout/page-header'
import { PageSection } from '@/components/layout/page-section'
import { CountryInterestChart } from '@/components/metric-charts/country-interest-chart'
import { MetricGrid } from '@/components/metric-charts/metric-grid'
import { PromisingRegions } from '@/components/metric-charts/promising-regions'
import { RegionExportsChart } from '@/components/metric-charts/region-exports-chart'
import { getGlobalData } from '@/lib/data'
import { getMetricPage } from '@/lib/navigation'

const page = getMetricPage('/metrics/global')
const trendsPage = getMetricPage('/metrics/trends')

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
        <PageSection
          title="국가별 검색 관심도"
          action={
            <Link
              href={trendsPage.href}
              className="text-primary inline-flex items-center gap-1 text-sm font-medium underline-offset-4 hover:underline"
            >
              트렌드 전망에서 자세히
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          }
        >
          <CountryInterestChart />
        </PageSection>
      </Container>
    </>
  )
}
