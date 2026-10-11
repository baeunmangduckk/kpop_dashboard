import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { ConfidenceBadge, NarrativeSection } from '@/components/confidence'
import { Container } from '@/components/layout/container'
import { PageHeader } from '@/components/layout/page-header'
import { NarrativePager } from '@/components/narratives/narrative-pager'
import { countByConfidence } from '@/lib/confidence'
import { getConclusion } from '@/lib/data'
import { getMetricContext } from '@/lib/data/metric-context'
import {
  conclusionLink,
  getNarrative,
  getNarrativeHref,
  getNarrativeMark,
  sourcesLink,
} from '@/lib/navigation'
import { CONFIDENCE_LEVELS } from '@/lib/schemas'

export const metadata: Metadata = {
  title: conclusionLink.title,
  description: conclusionLink.description,
}

// 종합 결론 - 서사별 정리(근거 지표) → 함께 읽은 종합 → 이 데이터로 말할 수 없는 것
export default async function ConclusionPage() {
  const [conclusion, ctx] = await Promise.all([
    getConclusion(),
    getMetricContext(),
  ])
  // 결론이 기대는 지표의 신뢰도 구성 (같은 지표를 두 번 세지 않음)
  const cited = ctx.pick([
    ...new Set(conclusion.points.flatMap(point => point.metricIds)),
  ])
  const counts = countByConfidence(cited)
  const levels = CONFIDENCE_LEVELS.filter(level => counts[level] > 0)

  return (
    <>
      <PageHeader eyebrow="결론" title={conclusion.title} narrow />
      <Container className="pb-16">
        <div className="mx-auto max-w-3xl space-y-12">
          <div className="space-y-4">
            <p className="text-lg leading-relaxed font-medium break-keep sm:text-xl">
              {conclusion.message}
            </p>
            <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
              <span>근거 지표 {cited.length}개</span>
              {levels.map(level => (
                <span key={level} className="inline-flex items-center gap-1.5">
                  <ConfidenceBadge confidence={level} />
                  {counts[level]}개
                </span>
              ))}
            </div>
            <p className="text-muted-foreground text-sm">
              제언이 아니라 데이터가 보여 주는 것만 정리했습니다.
            </p>
          </div>

          {conclusion.points.map(point => {
            const narrative = getNarrative(point.narrative)
            return (
              <NarrativeSection
                key={point.narrative}
                kicker={
                  narrative && `서사 ${getNarrativeMark(narrative.order)}`
                }
                heading={point.heading}
                body={point.body}
                evidence={ctx.pick(point.metricIds).map(metric => ({
                  metric,
                  href: ctx.hrefs.get(metric.id),
                }))}
                footer={
                  narrative && (
                    <Link
                      href={getNarrativeHref(narrative.slug)}
                      className="text-primary inline-flex items-center gap-1 text-sm font-medium hover:underline"
                    >
                      {narrative.title} 자세히 읽기
                      <ArrowRight className="size-3.5" aria-hidden />
                    </Link>
                  )
                }
              />
            )
          })}

          <section className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">
              함께 읽으면
            </h2>
            {conclusion.synthesis.map(paragraph => (
              <p key={paragraph} className="leading-relaxed break-keep">
                {paragraph}
              </p>
            ))}
          </section>

          <section className="bg-muted/40 space-y-4 rounded-lg border p-5">
            <h2 className="text-lg font-semibold tracking-tight">
              이 데이터로 말할 수 없는 것
            </h2>
            <ul className="list-disc space-y-2 pl-5 text-sm">
              {conclusion.caveats.map(caveat => (
                <li key={caveat} className="leading-relaxed break-keep">
                  {caveat}
                </li>
              ))}
            </ul>
            <Link
              href={sourcesLink.href}
              className="text-primary inline-flex items-center gap-1 text-sm font-medium hover:underline"
            >
              출처와 신뢰도, 알려진 불일치 보기
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </section>

          <NarrativePager
            current="conclusion"
            fallbackNext={{
              href: sourcesLink.href,
              kicker: '근거 확인',
              title: sourcesLink.title,
            }}
          />
        </div>
      </Container>
    </>
  )
}
