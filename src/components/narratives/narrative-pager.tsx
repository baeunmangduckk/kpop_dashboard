import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import {
  getNarrativeHref,
  getNarrativeMark,
  narratives,
} from '@/lib/navigation'
import type { NarrativeSlug } from '@/lib/schemas'

interface NarrativePagerProps {
  current: NarrativeSlug
}

// 이전/다음 서사 이동 (서사 ①~③ 순서)
export function NarrativePager({ current }: NarrativePagerProps) {
  const index = narratives.findIndex(item => item.slug === current)
  const prev = narratives[index - 1]
  const next = narratives[index + 1]

  return (
    <nav
      aria-label="서사 이동"
      className="grid gap-3 border-t pt-6 sm:grid-cols-2"
    >
      {prev ? (
        <Link
          href={getNarrativeHref(prev.slug)}
          rel="prev"
          className="hover:border-ring/60 rounded-lg border p-4 transition-colors"
        >
          <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
            <ArrowLeft className="size-3" aria-hidden />
            이전 서사 {getNarrativeMark(prev.order)}
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
          href={getNarrativeHref(next.slug)}
          rel="next"
          className="hover:border-ring/60 rounded-lg border p-4 text-right transition-colors"
        >
          <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
            다음 서사 {getNarrativeMark(next.order)}
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
