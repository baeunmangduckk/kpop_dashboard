import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/layout/page-header'
import { PagePlaceholder } from '@/components/layout/page-placeholder'
import { getNarrative, narratives } from '@/lib/navigation'

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

export default async function NarrativePage({ params }: NarrativePageProps) {
  const { slug } = await params
  const narrative = getNarrative(slug)
  if (!narrative) notFound()

  return (
    <>
      <PageHeader
        eyebrow={`서사 ${narrative.order}`}
        title={narrative.title}
        description={narrative.description}
      />
      <PagePlaceholder />
    </>
  )
}
