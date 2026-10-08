import type { Metadata } from 'next'
import { PageHeader } from '@/components/layout/page-header'
import { PagePlaceholder } from '@/components/layout/page-placeholder'
import { getFinanceData } from '@/lib/data'
import { getMetricPage } from '@/lib/navigation'

const page = getMetricPage('/metrics/finance')

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
}

export default async function FinancePage() {
  const data = await getFinanceData()

  return (
    <>
      <PageHeader
        eyebrow="지표"
        title={page.title}
        description={page.description}
      />
      <PagePlaceholder
        detail={`회사 ${data.companies.length}곳 · 재무 ${data.financials.length}건 로드됨`}
      />
    </>
  )
}
