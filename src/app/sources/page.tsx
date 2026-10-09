import type { Metadata } from 'next'
import { ConfidenceBadge } from '@/components/confidence'
import { ConfidenceSummary } from '@/components/home/confidence-summary'
import { Container } from '@/components/layout/container'
import { PageHeader } from '@/components/layout/page-header'
import { PageSection } from '@/components/layout/page-section'
import { DiscrepancyList } from '@/components/sources/discrepancy-list'
import { HashHighlighter } from '@/components/sources/hash-highlighter'
import {
  SourcesExplorer,
  type SourceRow,
} from '@/components/sources/sources-explorer'
import { CONFIDENCE_META } from '@/lib/confidence'
import { getDiscrepancies, getMetricRegistry } from '@/lib/data'
import { getMetricContext } from '@/lib/data/metric-context'
import { getSourceUsage } from '@/lib/data/source-usage'
import { getRouteTitle, sourcesLink } from '@/lib/navigation'
import { CONFIDENCE_LEVELS, type Confidence } from '@/lib/schemas'

export const metadata: Metadata = {
  title: sourcesLink.title,
  description: sourcesLink.description,
}

// 출처·신뢰도 (F011) - 출처 레지스트리, 신뢰도 분포·정의, 알려진 불일치
export default async function SourcesPage() {
  const [registry, discrepancies, ctx, usage] = await Promise.all([
    getMetricRegistry(),
    getDiscrepancies(),
    getMetricContext(),
    getSourceUsage(),
  ])

  const rows: SourceRow[] = ctx.sources.map(source => {
    const used = usage.get(source.id)
    return {
      id: source.id,
      publisher: source.publisher,
      title: source.title,
      year: source.year,
      pages: source.pages.map(href => ({ href, title: getRouteTitle(href) })),
      confidences: CONFIDENCE_LEVELS.filter(level =>
        used?.confidences.has(level)
      ),
      metrics: ctx.pick(used?.metricIds ?? []).map(metric => ({
        id: metric.id,
        label: metric.label,
        href: ctx.hrefs.get(metric.id),
      })),
    }
  })
  const counts = Object.fromEntries(
    CONFIDENCE_LEVELS.map(level => [
      level,
      registry.items.filter(item => item.confidence === level).length,
    ])
  ) as Record<Confidence, number>

  return (
    <>
      <PageHeader
        title={sourcesLink.title}
        description="모든 지표의 출처와 검증 상태(verified / estimated / unverified)를 공개합니다."
      />
      <HashHighlighter />
      <Container className="space-y-12 pb-16">
        <div className="grid gap-12 lg:grid-cols-3 lg:gap-8">
          <PageSection title="신뢰도 분포" description="전체 지표의 검증 상태">
            <div className="bg-card rounded-xl border p-5">
              <ConfidenceSummary counts={counts} />
            </div>
          </PageSection>
          <PageSection title="신뢰도 라벨 정의" className="lg:col-span-2">
            <dl className="bg-card divide-y rounded-xl border">
              {CONFIDENCE_LEVELS.map(level => (
                <div
                  key={level}
                  className="flex flex-col gap-2 p-4 sm:flex-row sm:items-start sm:gap-4"
                >
                  <dt className="shrink-0 sm:w-24">
                    <ConfidenceBadge confidence={level} />
                  </dt>
                  <dd className="text-muted-foreground text-sm leading-relaxed break-keep">
                    {CONFIDENCE_META[level].description}
                  </dd>
                </div>
              ))}
            </dl>
          </PageSection>
        </div>

        <PageSection
          title="출처 레지스트리"
          description="발행처·제목·연도와 이 출처를 사용하는 화면·지표입니다. 원문 링크는 원문 재확인(ROADMAP Task 015) 때 보강합니다."
        >
          <SourcesExplorer rows={rows} />
        </PageSection>

        <PageSection
          title="알려진 불일치"
          description="같은 지표에 출처마다 다른 값이 있는 경우, 채택한 값과 근거를 공개합니다."
        >
          <DiscrepancyList
            discrepancies={discrepancies}
            metrics={ctx.byId}
            hrefs={ctx.hrefs}
            sources={ctx.sources}
          />
        </PageSection>
      </Container>
    </>
  )
}
