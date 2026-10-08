import type { Metadata } from 'next'
import { PageHeader } from '@/components/layout/page-header'
import { PagePlaceholder } from '@/components/layout/page-placeholder'
import { getConcentrationData } from '@/lib/data'
import { getMetricPage } from '@/lib/navigation'

const page = getMetricPage('/metrics/concentration')

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
}

export default async function ConcentrationPage() {
  const data = await getConcentrationData()

  return (
    <>
      <PageHeader
        eyebrow="지표"
        title={page.title}
        description={page.description}
      />
      <PagePlaceholder
        detail={`지표 ${data.metricIds.length}개 · 점유율 ${data.shareTrend.points.length}개 연도 · 신호 ${data.signals.length}건 로드됨`}
      />
    </>
  )
}
