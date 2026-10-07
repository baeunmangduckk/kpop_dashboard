import { Container } from './container'

interface PagePlaceholderProps {
  message?: string
}

// 콘텐츠 구현 전 페이지 골격 안내 - ROADMAP Phase 3에서 실제 화면으로 교체
export function PagePlaceholder({
  message = '이 화면은 ROADMAP Phase 3에서 구현됩니다.',
}: PagePlaceholderProps) {
  return (
    <Container className="pb-12">
      <div className="text-muted-foreground rounded-lg border border-dashed p-8 text-center text-sm">
        {message}
      </div>
    </Container>
  )
}
