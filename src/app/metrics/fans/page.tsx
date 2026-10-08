import type { Metadata } from 'next'
import { PageHeader } from '@/components/layout/page-header'
import { PagePlaceholder } from '@/components/layout/page-placeholder'
import { getFansData } from '@/lib/data'
import { getMetricPage } from '@/lib/navigation'

const page = getMetricPage('/metrics/fans')

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
}

export default async function FansPage() {
  const data = await getFansData()

  return (
    <>
      <PageHeader
        eyebrow="지표"
        title={page.title}
        description={page.description}
      />
      <PagePlaceholder
        detail={`채널 ${data.channels.snapshots.length}개 · 순위 ${data.rankings.length}종 · 댓글 표본 ${data.sentiment.sampleSize}개 로드됨`}
      />
    </>
  )
}
