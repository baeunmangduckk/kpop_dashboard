import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { CONFIDENCE_META } from '@/lib/confidence'
import type { Confidence } from '@/lib/schemas'

interface NarrativeCardProps {
  order: number
  title: string
  message: string
  href: string
  evidenceCount: number
  // 근거 지표의 신뢰도 라벨별 개수
  confidenceCounts: Record<Confidence, number>
}

const ORDER_MARK = ['①', '②', '③']

// 홈의 서사 요약 카드 - 카드 전체가 서사 상세로 이동
export function NarrativeCard({
  order,
  title,
  message,
  href,
  evidenceCount,
  confidenceCounts,
}: NarrativeCardProps) {
  const breakdown = (Object.keys(confidenceCounts) as Confidence[])
    .filter(level => confidenceCounts[level] > 0)
    .map(level => `${CONFIDENCE_META[level].label} ${confidenceCounts[level]}`)
    .join(' · ')

  return (
    <Card className="hover:border-ring/60 relative gap-3 py-5 transition-colors">
      <CardHeader className="gap-2 px-5">
        <p className="text-primary text-sm font-medium">
          서사 {ORDER_MARK[order - 1] ?? order}
        </p>
        <h3 className="text-lg leading-snug font-semibold break-keep">
          <Link
            href={href}
            className="after:absolute after:inset-0 after:content-['']"
          >
            {title}
          </Link>
        </h3>
      </CardHeader>
      <CardContent className="flex-1 px-5">
        <p className="text-muted-foreground text-sm leading-relaxed break-keep">
          {message}
        </p>
      </CardContent>
      <CardFooter className="text-muted-foreground flex flex-wrap items-center justify-between gap-2 px-5 text-xs">
        <span>
          근거 지표 {evidenceCount}개{breakdown && ` (${breakdown})`}
        </span>
        <span className="text-primary inline-flex items-center gap-1 font-medium">
          서사 읽기
          <ArrowRight className="size-3" aria-hidden />
        </span>
      </CardFooter>
    </Card>
  )
}
