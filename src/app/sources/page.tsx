import type { Metadata } from 'next'
import { PageHeader } from '@/components/layout/page-header'
import { PagePlaceholder } from '@/components/layout/page-placeholder'
import { sourcesLink } from '@/lib/navigation'

export const metadata: Metadata = {
  title: sourcesLink.title,
  description: sourcesLink.description,
}

export default function SourcesPage() {
  return (
    <>
      <PageHeader
        title={sourcesLink.title}
        description="모든 지표의 출처와 검증 상태(verified / estimated / unverified)를 공개합니다."
      />
      <PagePlaceholder />
    </>
  )
}
