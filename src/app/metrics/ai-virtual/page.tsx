import type { Metadata } from 'next'
import { PageHeader } from '@/components/layout/page-header'
import { PagePlaceholder } from '@/components/layout/page-placeholder'
import { getAiVirtualData } from '@/lib/data'
import { getMetricPage } from '@/lib/navigation'

const page = getMetricPage('/metrics/ai-virtual')

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
}

export default async function AiVirtualPage() {
  const data = await getAiVirtualData()

  return (
    <>
      <PageHeader
        eyebrow="지표"
        title={page.title}
        description={page.description}
      />
      <PagePlaceholder
        detail={`지표 ${data.metricIds.length + data.platformMetricIds.length}개 · 사례 ${data.cases.length}건 로드됨`}
      />
    </>
  )
}
