import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { NarrativeSection } from '@/components/confidence'
import { Container } from '@/components/layout/container'
import { PageHeader } from '@/components/layout/page-header'
import { NarrativePager } from '@/components/narratives/narrative-pager'
import { CONFIDENCE_META, countByConfidence } from '@/lib/confidence'
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
  const breakdown = CONFIDENCE_LEVELS.filter(level => counts[level] > 0)
    .map(level => `${CONFIDENCE_META[level].label} ${counts[level]}개`)
    .join(' · ')

  return (
    <>
      <PageHeader
        eyebrow="결론"
        title={conclusion.title}
        description={conclusion.message}
        narrow
      />
      <Container className="pb-16">
        <div className="mx-auto max-w-3xl space-y-12">
          <p className="text-muted-foreground text-sm">
            근거 지표 {cited.length}개 ({breakdown}). 제언이 아니라 데이터가
            보여 주는 것만 정리했습니다.
          </p>

          {conclusion.points.map(point => {
            const narrative = getNarrative(point.narrative)
            return (
              <NarrativeSection
                key={point.narrative}
                heading={point.heading}
                body={point.body}
                evidence={ctx.pick(point.metricIds).map(metric => ({
                  metric,
                  href: ctx.hrefs.get(metric.id),
                }))}
              >
                {narrative && (
                  <Link
                    href={getNarrativeHref(narrative.slug)}
                    className="text-primary inline-flex items-center gap-1 text-sm font-medium hover:underline"
                  >
                    서사 {getNarrativeMark(narrative.order)} {narrative.title}{' '}
                    읽기
                    <ArrowRight className="size-3.5" aria-hidden />
                  </Link>
                )}
              </NarrativeSection>
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

          <section className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">
              이 데이터로 말할 수 없는 것
            </h2>
            <ul className="list-disc space-y-2 pl-5">
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

          <NarrativePager current="conclusion" />
        </div>
      </Container>
    </>
  )
}
