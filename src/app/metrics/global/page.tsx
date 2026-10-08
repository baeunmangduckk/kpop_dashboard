import type { Metadata } from 'next'
import { PageHeader } from '@/components/layout/page-header'
import { PagePlaceholder } from '@/components/layout/page-placeholder'
import { getGlobalData } from '@/lib/data'
import { getMetricPage } from '@/lib/navigation'

const page = getMetricPage('/metrics/global')

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
}

export default async function GlobalPage() {
  const data = await getGlobalData()

  return (
    <>
      <PageHeader
        eyebrow="지표"
        title={page.title}
        description={page.description}
      />
      <PagePlaceholder
        detail={`지표 ${data.metricIds.length}개 · 지역 ${data.regionExports.rows.length}곳 · 유망 권역 ${data.promisingRegions.regions.length}곳 로드됨`}
      />
    </>
  )
}
