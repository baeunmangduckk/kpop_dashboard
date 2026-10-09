import type { Metadata } from 'next'
import { PageHeader } from '@/components/layout/page-header'
import { PagePlaceholder } from '@/components/layout/page-placeholder'
import { getDiscrepancies, getSources } from '@/lib/data'
import { sourcesLink } from '@/lib/navigation'

export const metadata: Metadata = {
  title: sourcesLink.title,
  description: sourcesLink.description,
}

export default async function SourcesPage() {
  const [sources, discrepancies] = await Promise.all([
    getSources(),
    getDiscrepancies(),
  ])
  const usedCount = sources.filter(source => source.pages.length > 0).length

  return (
    <>
      <PageHeader
        title={sourcesLink.title}
        description="모든 지표의 출처와 검증 상태(verified / estimated / unverified)를 공개합니다."
      />
      <PagePlaceholder
        detail={`출처 ${sources.length}건(지표 사용 ${usedCount}건) · 알려진 불일치 ${discrepancies.length}건 로드됨`}
      />
    </>
  )
}
