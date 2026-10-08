import type { Metadata } from 'next'
import { PageHeader } from '@/components/layout/page-header'
import { PagePlaceholder } from '@/components/layout/page-placeholder'
import { getTrendsData } from '@/lib/data'
import { getMetricPage } from '@/lib/navigation'

const page = getMetricPage('/metrics/trends')

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
}

export default async function TrendsPage() {
  const data = await getTrendsData()

  return (
    <>
      <PageHeader
        eyebrow="지표"
        title={page.title}
        description={page.description}
      />
      <PagePlaceholder
        detail={`키워드 ${data.keywords.length}개 · 시계열 ${data.series.length}점 로드됨${data.isDummy ? ' (더미)' : ''}`}
      />
    </>
  )
}
