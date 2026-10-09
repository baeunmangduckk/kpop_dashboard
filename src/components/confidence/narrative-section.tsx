import type { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { formatMetricValue } from '@/lib/format'
import type { Metric } from '@/lib/schemas'
import { cn } from '@/lib/utils'
import { ConfidenceBadge } from './confidence-badge'

export interface NarrativeEvidence {
  metric: Metric
  // 근거 지표 페이지 경로 (없으면 링크 생략)
  href?: string
}

interface NarrativeSectionProps {
  heading?: string
  body: string
  evidence: NarrativeEvidence[]
  // 인라인 차트 슬롯 (Task 007 차트 래퍼)
  children?: ReactNode
  className?: string
}

// 서사 문단 + 인라인 차트 + 근거 지표 묶음 (F001)
export function NarrativeSection({
  heading,
  body,
  evidence,
  children,
  className,
}: NarrativeSectionProps) {
  return (
    <section className={cn('space-y-4', className)}>
      {heading && (
        <h2 className="text-xl font-semibold tracking-tight">{heading}</h2>
      )}
      <p className="leading-relaxed break-keep">{body}</p>
      {children}
      {evidence.length > 0 && (
        <div className="bg-muted/40 rounded-lg border p-4">
          <p className="text-muted-foreground mb-3 text-xs font-semibold">
            근거 지표
          </p>
          <ul className="space-y-3">
            {evidence.map(({ metric, href }) => (
              <li
                key={metric.id}
                className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1"
              >
                <span className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-medium">{metric.label}</span>
                  <span className="text-muted-foreground">
                    {formatMetricValue(metric.value, metric.unit)}
                  </span>
                  <ConfidenceBadge
                    confidence={metric.confidence}
                    method={metric.method}
                  />
                </span>
                {href && (
                  <Link
                    href={href}
                    className="text-primary inline-flex items-center gap-1 text-xs font-medium underline-offset-4 hover:underline"
                  >
                    근거 지표 보기
                    <ArrowRight className="size-3" aria-hidden />
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
