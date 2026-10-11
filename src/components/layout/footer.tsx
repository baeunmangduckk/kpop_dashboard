import Link from 'next/link'
import { getMetricRegistry } from '@/lib/data'
import { conclusionLink, sourcesLink } from '@/lib/navigation'
import { Container } from './container'

const LINKS = [conclusionLink, sourcesLink]

export async function Footer() {
  const registry = await getMetricRegistry()
  // 지표 기준일 중 가장 최근 날짜 (YYYY-MM-DD라 문자열 비교로 충분)
  const asOf = registry.items
    .flatMap(item => (item.asOf ? [item.asOf] : []))
    .sort()
    .at(-1)

  return (
    <footer className="border-t">
      <Container>
        <div className="text-muted-foreground flex flex-col items-center gap-3 py-8 text-center text-sm">
          <nav aria-label="바닥글" className="flex flex-wrap gap-x-4 gap-y-1">
            {LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-foreground underline-offset-4 hover:underline"
              >
                {link.title}
              </Link>
            ))}
          </nav>
          <p>
            모든 지표는 출처와 신뢰도 라벨을 함께 표기합니다.
            {asOf && ` 데이터 기준일 ${asOf}.`}
          </p>
          <p>© 2026 K-POP 산업 인사이트 대시보드</p>
        </div>
      </Container>
    </footer>
  )
}
