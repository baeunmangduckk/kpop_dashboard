import { Container } from './container'

export function Footer() {
  return (
    <footer className="border-t">
      <Container>
        <div className="py-8">
          <div className="text-center">
            <p className="text-muted-foreground text-sm">
              © 2026 K-POP 산업 인사이트 대시보드. 모든 지표는 출처와 신뢰도
              라벨을 함께 표기합니다.
            </p>
          </div>
        </div>
      </Container>
    </footer>
  )
}
