import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import {
  conclusionLink,
  getNarrativeHref,
  getNarrativeMark,
  narratives,
} from '@/lib/navigation'
import type { NarrativeSlug } from '@/lib/schemas'

interface NarrativePagerProps {
  current: NarrativeSlug | 'conclusion'
  // 읽는 순서의 마지막 화면에서 오른쪽 자리에 둘 다음 행동
  fallbackNext?: PagerLink
}

export interface PagerLink {
  href: string
  // 이동 링크 위에 붙는 짧은 이름 (서사 ①, 결론)
  kicker: string
  title: string
}

interface Step extends PagerLink {
  key: string
}

// 읽는 순서: 서사 ① → ② → ③ → 종합 결론
const STEPS: Step[] = [
  ...narratives.map(item => ({
    key: item.slug,
    href: getNarrativeHref(item.slug),
    kicker: `서사 ${getNarrativeMark(item.order)}`,
    title: item.title,
  })),
  {
    key: 'conclusion',
    href: conclusionLink.href,
    kicker: '마무리',
    title: conclusionLink.title,
  },
]

// 이전/다음 이동 (서사 ①~③과 종합 결론)
export function NarrativePager({ current, fallbackNext }: NarrativePagerProps) {
  const index = STEPS.findIndex(item => item.key === current)
  const prev = STEPS[index - 1]
  const next: PagerLink | undefined = STEPS[index + 1] ?? fallbackNext

  return (
    <nav
      aria-label="서사 이동"
      className="grid gap-3 border-t pt-6 sm:grid-cols-2"
    >
      {prev ? (
        <Link
          href={prev.href}
          rel="prev"
          className="hover:border-ring/60 rounded-lg border p-4 transition-colors"
        >
          <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
            <ArrowLeft className="size-3" aria-hidden />
            이전 {prev.kicker}
          </span>
          <span className="mt-1 block font-medium break-keep">
            {prev.title}
          </span>
        </Link>
      ) : (
        <span aria-hidden className="hidden sm:block" />
      )}
      {next && (
        <Link
          href={next.href}
          rel="next"
          className="hover:border-ring/60 rounded-lg border p-4 text-right transition-colors"
        >
          <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
            다음 {next.kicker}
            <ArrowRight className="size-3" aria-hidden />
          </span>
          <span className="mt-1 block font-medium break-keep">
            {next.title}
          </span>
        </Link>
      )}
    </nav>
  )
}
