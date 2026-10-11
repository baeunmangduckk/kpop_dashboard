import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Container } from '@/components/layout/container'
import { PageHeader } from '@/components/layout/page-header'
import { conclusionLink, homeLink, sourcesLink } from '@/lib/navigation'

const LINKS = [
  { href: homeLink.href, label: '홈으로 가기' },
  { href: conclusionLink.href, label: conclusionLink.title },
  { href: sourcesLink.href, label: sourcesLink.title },
]

// 없는 주소로 들어왔을 때의 안내
export default function NotFound() {
  return (
    <>
      <PageHeader
        eyebrow="404"
        title="페이지를 찾을 수 없습니다"
        description="주소가 바뀌었거나 없는 화면입니다. 아래 화면에서 다시 시작해 보세요."
      />
      <Container className="pb-16">
        <ul className="space-y-2">
          {LINKS.map(link => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-primary inline-flex items-center gap-1 text-sm font-medium underline-offset-4 hover:underline"
              >
                {link.label}
                <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </>
  )
}
