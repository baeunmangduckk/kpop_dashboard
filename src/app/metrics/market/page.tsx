import type { Metadata } from 'next'
import { PageHeader } from '@/components/layout/page-header'
import { PagePlaceholder } from '@/components/layout/page-placeholder'
import { getMetricPage } from '@/lib/navigation'

const page = getMetricPage('/metrics/market')

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
}

export default function MarketPage() {
  return (
    <>
      <PageHeader
        eyebrow="지표"
        title={page.title}
        description={page.description}
      />
      <PagePlaceholder />
    </>
  )
}
