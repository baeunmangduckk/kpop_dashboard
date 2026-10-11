import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { PageSection } from '@/components/layout/page-section'
import { getNarratives } from '@/lib/data'
import { getMetricContext } from '@/lib/data/metric-context'
import {
  getNarrativeHref,
  getNarrativeMark,
  narratives,
} from '@/lib/navigation'

interface RelatedNarrativesProps {
  // 지표 페이지 경로 (예: /metrics/market)
  href: string
}

// 지표 화면 끝에서 이 화면의 지표를 근거로 쓰는 서사로 돌아가는 링크
export async function RelatedNarratives({ href }: RelatedNarrativesProps) {
  const [stories, ctx] = await Promise.all([
    getNarratives(),
    getMetricContext(),
  ])
  const related = narratives.filter(narrative =>
    stories
      .find(story => story.id === narrative.slug)
      ?.sections.some(section =>
        section.metricIds.some(id => ctx.hrefs.get(id) === href)
      )
  )
  if (related.length === 0) return null

  return (
    <PageSection
      title="이 지표를 근거로 쓰는 서사"
      description="숫자가 어떤 이야기로 이어지는지 서사에서 읽을 수 있습니다."
    >
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {related.map(narrative => (
          <li key={narrative.slug}>
            <Link
              href={getNarrativeHref(narrative.slug)}
              className="hover:border-ring/60 bg-card block h-full rounded-lg border p-4 transition-colors"
            >
              <span className="text-primary text-xs font-medium">
                서사 {getNarrativeMark(narrative.order)}
              </span>
              <span className="mt-1 flex items-center gap-1 font-medium break-keep">
                {narrative.title}
                <ArrowRight className="size-3.5 shrink-0" aria-hidden />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </PageSection>
  )
}
