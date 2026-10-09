import type { Metadata } from 'next'
import { ChartFrame } from '@/components/charts'
import { NoticeBadge } from '@/components/confidence'
import { Container } from '@/components/layout/container'
import { PageHeader } from '@/components/layout/page-header'
import { PageSection } from '@/components/layout/page-section'
import { CountryInterestChart } from '@/components/metric-charts/country-interest-chart'
import { TrendsExplorer } from '@/components/trends/trends-explorer'
import { getSources, getTrendsData } from '@/lib/data'
import { getMetricPage } from '@/lib/navigation'
import { resolveSources } from '@/lib/sources'

const page = getMetricPage('/metrics/trends')

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
}

// 트렌드 전망 (F008) - 검색 관심도 기반 선행 신호 (Task 014 전까지 더미 데이터)
export default async function TrendsPage() {
  const [trends, sources] = await Promise.all([getTrendsData(), getSources()])
  const trendSources = resolveSources(trends.sourceIds, sources)

  return (
    <>
      <PageHeader
        eyebrow="지표"
        title={page.title}
        description={page.description}
      />
      <Container className="space-y-12 pb-16">
        {trends.isDummy && (
          <NoticeBadge
            kind="dummy"
            detail="이 화면의 수치는 화면 구성용 예시입니다. Google Trends 실데이터 연동(ROADMAP Task 014) 후 교체됩니다."
          />
        )}
        <PageSection
          title="키워드 관심도"
          description="키워드를 눌러 비교 대상을 고르세요. 컴백·투어 전후 변화를 보는 용도입니다."
        >
          <TrendsExplorer data={trends} sources={trendSources} />
        </PageSection>
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-4">
          <PageSection title="급상승 검색어">
            <ChartFrame
              title="키워드별 급상승 검색어"
              description="상승률은 이전 기간 대비, '급상승'은 Google Trends가 5,000% 이상으로 표기한 경우"
              notices={
                trends.isDummy ? (
                  <NoticeBadge kind="dummy" detail="Task 014에서 교체" />
                ) : undefined
              }
              confidence={trends.confidence}
              sources={trendSources}
              table={{
                columns: ['키워드', '검색어', '상승률'],
                rows: trends.risingQueries.map(query => [
                  query.keyword,
                  query.query,
                  query.growth === null ? '급상승' : `+${query.growth}%`,
                ]),
              }}
            />
          </PageSection>
          <PageSection title="국가별 관심도">
            <CountryInterestChart />
          </PageSection>
        </div>
      </Container>
    </>
  )
}
