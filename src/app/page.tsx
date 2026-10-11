import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { KpiCard } from '@/components/confidence'
import { ConfidenceSummary } from '@/components/home/confidence-summary'
import { NarrativeCard } from '@/components/home/narrative-card'
import { InsightList } from '@/components/insights/insight-list'
import { Container } from '@/components/layout/container'
import { PageHeader } from '@/components/layout/page-header'
import { PageSection } from '@/components/layout/page-section'
import { Big4RevenueChart } from '@/components/metric-charts/big4-revenue-chart'
import { TotalSalesChart } from '@/components/metric-charts/total-sales-chart'
import { countByConfidence } from '@/lib/confidence'
import { getInsights, getMetricRegistry, getNarratives } from '@/lib/data'
import { getMetricContext } from '@/lib/data/metric-context'
import {
  conclusionLink,
  getNarrativeHref,
  narratives as narrativePages,
} from '@/lib/navigation'

// 홈(스토리) - 핵심 KPI, 대표 차트, 3대 서사, 인사이트, 신뢰도 분포
export default async function Home() {
  const [registry, insights, narratives, ctx] = await Promise.all([
    getMetricRegistry(),
    getInsights(),
    getNarratives(),
    getMetricContext(),
  ])

  const kpis = ctx.pick(registry.homeKpiIds)
  const storyById = new Map(narratives.map(story => [story.id, story]))
  const insightHrefs = new Map(
    insights.flatMap(insight => {
      const href = insight.metricIds.map(id => ctx.hrefs.get(id)).find(Boolean)
      return href ? [[insight.id, href] as const] : []
    })
  )
  const manual = insights.filter(insight => insight.kind === 'manual')
  const auto = insights.filter(insight => insight.kind === 'auto')

  return (
    <>
      <PageHeader
        title="K-POP 산업 인사이트 대시보드"
        description="출처와 신뢰도를 먼저 보여주고, 숫자가 만드는 K-pop 산업의 이야기를 읽을 수 있는 대시보드"
      />
      <Container className="space-y-12 pb-16">
        <PageSection
          title="핵심 지표"
          description="카드를 누르면 해당 지표 화면으로 이동합니다. 신뢰도 배지를 누르면 라벨의 의미를 볼 수 있습니다."
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {kpis.map(metric => (
              <KpiCard
                key={metric.id}
                metric={metric}
                sources={ctx.sourcesOf(metric.sourceIds)}
                href={ctx.hrefs.get(metric.id)}
              />
            ))}
          </div>
        </PageSection>

        <PageSection
          title="한눈에 보기"
          description="매출은 늘었지만 이익과 판매량은 같은 방향으로 움직이지 않습니다."
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <Big4RevenueChart />
            <TotalSalesChart />
          </div>
        </PageSection>

        <PageSection
          title="3대 서사"
          description="숫자들이 함께 가리키는 K-pop 산업의 흐름입니다."
        >
          <div className="grid gap-4 lg:grid-cols-3">
            {narrativePages.map(page => {
              const story = storyById.get(page.slug)
              const evidence = ctx.pick([
                ...new Set(story?.sections.flatMap(s => s.metricIds) ?? []),
              ])
              return (
                <NarrativeCard
                  key={page.slug}
                  order={page.order}
                  title={story?.title ?? page.title}
                  message={story?.message ?? page.description}
                  href={getNarrativeHref(page.slug)}
                  evidenceCount={evidence.length}
                  confidenceCounts={countByConfidence(evidence)}
                />
              )
            })}
          </div>
          <Link
            href={conclusionLink.href}
            className="text-primary mt-4 inline-flex items-center gap-1 text-sm font-medium hover:underline"
          >
            세 서사의 종합 결론 보기
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </PageSection>

        <div className="grid gap-12 lg:grid-cols-3 lg:gap-8">
          <PageSection
            title="인사이트"
            description="지표를 함께 읽고 정리한 해석입니다. 지표 변화만 옮긴 문장은 아래에 접어 두었습니다."
            className="lg:col-span-2"
          >
            {insights.length === 0 ? (
              <InsightList insights={[]} hrefs={insightHrefs} />
            ) : (
              // 해석을 먼저 보여 주고, 핵심 지표 카드와 겹치는 지표 변화 문장은 접어 둔다
              <div className="bg-card divide-y rounded-xl border px-5 [&>*]:py-5">
                {manual.length > 0 && (
                  <InsightList insights={manual} hrefs={insightHrefs} />
                )}
                {auto.length > 0 && (
                  <details>
                    <summary className="text-muted-foreground hover:text-foreground w-fit cursor-pointer text-sm">
                      지표 변화 {auto.length}건 보기
                    </summary>
                    <InsightList
                      insights={auto}
                      hrefs={insightHrefs}
                      className="mt-4"
                    />
                  </details>
                )}
              </div>
            )}
          </PageSection>
          <PageSection
            title="신뢰도 분포"
            description="전체 지표의 검증 상태"
            className="lg:sticky lg:top-24 lg:self-start"
          >
            <div className="bg-card rounded-xl border p-5">
              <ConfidenceSummary counts={countByConfidence(registry.items)} />
            </div>
          </PageSection>
        </div>
      </Container>
    </>
  )
}
