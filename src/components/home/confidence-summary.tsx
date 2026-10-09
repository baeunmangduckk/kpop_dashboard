import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { ConfidenceBadge } from '@/components/confidence'
import { CONFIDENCE_META } from '@/lib/confidence'
import { CONFIDENCE_LEVELS, type Confidence } from '@/lib/schemas'
import { sourcesLink } from '@/lib/navigation'

const BAR_COLOR: Record<Confidence, string> = {
  verified: 'bg-verified-foreground',
  estimated: 'bg-estimated-foreground',
  unverified: 'bg-unverified-foreground',
}

interface ConfidenceSummaryProps {
  counts: Record<Confidence, number>
}

// 지표 신뢰도 분포 요약 (F010) - 라벨별 지표 수와 비율, 출처·신뢰도 페이지로 이동
export function ConfidenceSummary({ counts }: ConfidenceSummaryProps) {
  const total = CONFIDENCE_LEVELS.reduce((sum, level) => sum + counts[level], 0)

  return (
    <div className="space-y-4">
      <ul className="space-y-3">
        {CONFIDENCE_LEVELS.map(level => {
          const percent = total > 0 ? (counts[level] / total) * 100 : 0
          return (
            <li
              key={level}
              data-confidence-count={level}
              className="space-y-1.5"
            >
              <div className="flex items-center justify-between gap-2 text-sm">
                <ConfidenceBadge confidence={level} />
                <span className="tabular-nums">
                  {counts[level]}개
                  <span className="text-muted-foreground">
                    {' '}
                    ({percent.toFixed(0)}%)
                  </span>
                </span>
              </div>
              <div
                className="bg-muted h-1.5 overflow-hidden rounded-full"
                role="img"
                aria-label={`${CONFIDENCE_META[level].label} ${percent.toFixed(0)}%`}
              >
                <div
                  className={`${BAR_COLOR[level]} h-full rounded-full`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </li>
          )
        })}
      </ul>
      <p className="text-muted-foreground text-xs leading-relaxed">
        전체 지표 {total}개 기준. 미검증 지표는 원문 재확인 후 단계적으로
        승격합니다.
      </p>
      <Link
        href={sourcesLink.href}
        className="text-primary inline-flex items-center gap-1 text-sm font-medium underline-offset-4 hover:underline"
      >
        출처·신뢰도 자세히 보기
        <ArrowRight className="size-3.5" aria-hidden />
      </Link>
    </div>
  )
}
