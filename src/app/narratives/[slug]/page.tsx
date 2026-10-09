import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { NarrativeSection } from '@/components/confidence'
import { Container } from '@/components/layout/container'
import { PageHeader } from '@/components/layout/page-header'
import { NarrativePager } from '@/components/narratives/narrative-pager'
import { SECTION_CHARTS } from '@/components/narratives/section-charts'
import { getNarratives } from '@/lib/data'
import { getMetricContext } from '@/lib/data/metric-context'
import { getNarrative, getNarrativeMark, narratives } from '@/lib/navigation'

interface NarrativePageProps {
  params: Promise<{ slug: string }>
}

// 정의된 3대 서사 외의 slug는 404 처리
export const dynamicParams = false

export function generateStaticParams() {
  return narratives.map(narrative => ({ slug: narrative.slug }))
}

export async function generateMetadata({
  params,
}: NarrativePageProps): Promise<Metadata> {
  const { slug } = await params
  const narrative = getNarrative(slug)
  if (!narrative) return {}
  return { title: narrative.title, description: narrative.description }
}

// 서사 상세 - 문단 + 인라인 차트 + 근거 지표를 순서대로 읽는 스토리 화면
export default async function NarrativePage({ params }: NarrativePageProps) {
  const { slug } = await params
  const narrative = getNarrative(slug)
  if (!narrative) notFound()

  const [stories, ctx] = await Promise.all([
    getNarratives(),
    getMetricContext(),
  ])
  const story = stories.find(item => item.id === narrative.slug)
  if (!story) notFound()
  const charts = SECTION_CHARTS[narrative.slug]

  return (
    <>
      <PageHeader
        eyebrow={`서사 ${getNarrativeMark(narrative.order)}`}
        title={story.title}
        description={story.message}
      />
      <Container className="pb-16">
        {/* 읽기 폭 제한, 왼쪽 정렬은 페이지 제목과 맞춤 */}
        <div className="max-w-3xl space-y-12">
          {story.sections.map((section, index) => {
            const Chart = charts[index]
            return (
              <NarrativeSection
                key={section.heading ?? index}
                heading={section.heading}
                body={section.body}
                evidence={ctx.pick(section.metricIds).map(metric => ({
                  metric,
                  href: ctx.hrefs.get(metric.id),
                }))}
              >
                {Chart && <Chart />}
              </NarrativeSection>
            )
          })}
          <NarrativePager current={narrative.slug} />
        </div>
      </Container>
    </>
  )
}
