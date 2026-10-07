import { PageHeader } from '@/components/layout/page-header'
import { PagePlaceholder } from '@/components/layout/page-placeholder'

// 홈(스토리) 페이지 골격 - 서사 카드·KPI는 ROADMAP Phase 3에서 구현
export default function Home() {
  return (
    <>
      <PageHeader
        title="K-POP 산업 인사이트 대시보드"
        description="출처와 신뢰도를 먼저 보여주고, 숫자가 만드는 K-pop 산업의 이야기를 읽을 수 있는 대시보드"
      />
      <PagePlaceholder message="핵심 KPI 6종과 3대 서사 카드는 ROADMAP Phase 3에서 구현됩니다." />
    </>
  )
}
