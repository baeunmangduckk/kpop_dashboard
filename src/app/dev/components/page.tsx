import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Container } from '@/components/layout/container'
import { PageHeader } from '@/components/layout/page-header'
import {
  ConfidenceBadge,
  KpiCard,
  NarrativeSection,
  NoticeBadge,
} from '@/components/confidence'
import { CONFIDENCE_LEVELS, type Metric } from '@/lib/schemas'
import { getMetricRegistry, getNarratives, getSources } from '@/lib/data'
import { getMetricHrefMap } from '@/lib/data/metric-pages'
import { resolveSources } from '@/lib/sources'
import { ChartShowcase } from './chart-showcase'

export const metadata: Metadata = {
  title: '컴포넌트 쇼케이스',
  robots: { index: false },
}

// 개발 전용 - 신뢰도·출처 공통 컴포넌트 시각 검증 (프로덕션에서는 404)
export default async function ComponentShowcasePage() {
  if (process.env.NODE_ENV === 'production') notFound()

  const [registry, narratives, sources, hrefs] = await Promise.all([
    getMetricRegistry(),
    getNarratives(),
    getSources(),
    getMetricHrefMap(),
  ])
  const metricById = new Map(registry.items.map(item => [item.id, item]))
  const kpis = registry.homeKpiIds
    .map(id => metricById.get(id))
    .filter((metric): metric is Metric => metric !== undefined)
  const estimated = registry.items.find(item => item.confidence === 'estimated')
  const section = narratives[0]?.sections[1]

  // 결측 표시 확인용 샘플 (실제 데이터 아님)
  const missingSample: Metric = {
    ...kpis[0],
    id: 'showcase-missing',
    label: '결측 표시 예시',
    value: null,
    delta: null,
    note: undefined,
  }

  return (
    <>
      <PageHeader
        eyebrow="개발 전용"
        title="신뢰도·출처 공통 컴포넌트"
        description="Task 006 컴포넌트를 실제 데이터로 렌더링합니다. 프로덕션 빌드에서는 노출되지 않습니다."
      />
      <Container className="space-y-12 pb-16">
        <section className="space-y-3" data-showcase="badges">
          <h2 className="text-lg font-semibold">ConfidenceBadge</h2>
          <div className="flex flex-wrap gap-2">
            {CONFIDENCE_LEVELS.map(level => (
              <ConfidenceBadge
                key={level}
                confidence={level}
                method={level === 'estimated' ? estimated?.method : undefined}
              />
            ))}
          </div>
        </section>

        <section className="space-y-3" data-showcase="notices">
          <h2 className="text-lg font-semibold">NoticeBadge</h2>
          <div className="flex flex-wrap gap-3">
            <NoticeBadge kind="proxy" detail="방송콘텐츠 수출 통계 사용" />
            <NoticeBadge kind="missing" detail="2024년 원자료 없음" />
            <NoticeBadge kind="relative" detail="기간 내 최댓값 100 기준" />
            <NoticeBadge kind="sample" detail="n=500 · 2026-09-28 수집" />
            <NoticeBadge kind="dummy" detail="Task 014에서 교체" />
          </div>
        </section>

        <section className="space-y-3" data-showcase="kpis">
          <h2 className="text-lg font-semibold">
            KpiCard (홈 KPI 6종 + 결측 예시)
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...kpis, missingSample].map(metric => (
              <KpiCard
                key={metric.id}
                metric={metric}
                sources={resolveSources(metric.sourceIds, sources)}
                href={hrefs.get(metric.id)}
              />
            ))}
            {estimated && (
              <KpiCard
                metric={estimated}
                sources={resolveSources(estimated.sourceIds, sources)}
                href={hrefs.get(estimated.id)}
              />
            )}
          </div>
        </section>

        {section && (
          <section className="max-w-3xl space-y-3" data-showcase="narrative">
            <h2 className="text-lg font-semibold">NarrativeSection</h2>
            <NarrativeSection
              heading={section.heading}
              body={section.body}
              evidence={section.metricIds
                .map(id => metricById.get(id))
                .filter((metric): metric is Metric => metric !== undefined)
                .map(metric => ({ metric, href: hrefs.get(metric.id) }))}
            >
              <div className="text-muted-foreground rounded-md border border-dashed p-6 text-center text-xs">
                인라인 차트 슬롯 (Task 007)
              </div>
            </NarrativeSection>
          </section>
        )}
        <ChartShowcase />
      </Container>
    </>
  )
}
