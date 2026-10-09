import { KpiCard } from '@/components/confidence'
import { ConfidenceSummary } from '@/components/home/confidence-summary'
import { NarrativeCard } from '@/components/home/narrative-card'
import { InsightList } from '@/components/insights/insight-list'
import { Container } from '@/components/layout/container'
import { PageHeader } from '@/components/layout/page-header'
import { PageSection } from '@/components/layout/page-section'
import { getInsights, getMetricRegistry, getNarratives } from '@/lib/data'
import { getMetricContext } from '@/lib/data/metric-context'
import {
  getNarrativeHref,
  narratives as narrativePages,
} from '@/lib/navigation'
import { CONFIDENCE_LEVELS, type Confidence, type Metric } from '@/lib/schemas'

function countByConfidence(metrics: Metric[]): Record<Confidence, number> {
  const counts = Object.fromEntries(
    CONFIDENCE_LEVELS.map(level => [level, 0])
  ) as Record<Confidence, number>
  for (const metric of metrics) counts[metric.confidence] += 1
  return counts
}

// 홈(스토리) - 핵심 KPI, 3대 서사, 인사이트, 신뢰도 분포
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
        </PageSection>

        <div className="grid gap-12 lg:grid-cols-3 lg:gap-8">
          <PageSection
            title="인사이트"
            description="수동은 분석가가 작성한 해석, 자동은 지표 변화로 생성한 문장입니다."
            className="lg:col-span-2"
          >
            {insights.length === 0 ? (
              <InsightList insights={[]} hrefs={insightHrefs} />
            ) : (
              // 수동(해석) → 자동(지표 변화) 순서, 비어 있는 묶음은 생략
              <div className="bg-card divide-y rounded-xl border px-5 [&>*]:py-5">
                {[manual, auto]
                  .filter(group => group.length > 0)
                  .map(group => (
                    <InsightList
                      key={group[0].kind}
                      insights={group}
                      hrefs={insightHrefs}
                    />
                  ))}
              </div>
            )}
          </PageSection>
          <PageSection title="신뢰도 분포" description="전체 지표의 검증 상태">
            <div className="bg-card rounded-xl border p-5">
              <ConfidenceSummary counts={countByConfidence(registry.items)} />
            </div>
          </PageSection>
        </div>
      </Container>
    </>
  )
}
