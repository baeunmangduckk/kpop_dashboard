import { Container } from './container'

interface PagePlaceholderProps {
  message?: string
  // 로더가 읽어 온 데이터 요약 (Phase 3 화면 구현 전 연결 확인용)
  detail?: string
}

// 콘텐츠 구현 전 페이지 골격 안내 - ROADMAP Phase 3에서 실제 화면으로 교체
export function PagePlaceholder({
  message = '이 화면은 ROADMAP Phase 3에서 구현됩니다.',
  detail,
}: PagePlaceholderProps) {
  return (
    <Container className="pb-12">
      <div className="text-muted-foreground space-y-2 rounded-lg border border-dashed p-8 text-center text-sm">
        <p>{message}</p>
        {detail && <p className="text-xs">{detail}</p>}
      </div>
    </Container>
  )
}
