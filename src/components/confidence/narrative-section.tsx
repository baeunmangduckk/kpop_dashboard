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
  // 제목 위 짧은 표시 (예: 서사 ①)
  kicker?: string
  heading?: string
  body: string
  evidence: NarrativeEvidence[]
  // 인라인 차트 슬롯
  children?: ReactNode
  // 근거 지표 아래 슬롯 (이어 읽기 링크 등)
  footer?: ReactNode
  className?: string
}

// 서사 문단 + 인라인 차트 + 근거 지표 묶음 (F001)
export function NarrativeSection({
  kicker,
  heading,
  body,
  evidence,
  children,
  footer,
  className,
}: NarrativeSectionProps) {
  return (
    <section className={cn('space-y-4', className)}>
      {(kicker || heading) && (
        <div className="space-y-1">
          {kicker && (
            <p className="text-primary text-sm font-medium">{kicker}</p>
          )}
          {heading && (
            <h2 className="text-xl font-semibold tracking-tight">{heading}</h2>
          )}
        </div>
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
                className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm"
              >
                {/* 지표명이 곧 지표 화면 링크 */}
                {href ? (
                  <Link
                    href={href}
                    className="inline-flex items-center gap-1 font-medium underline-offset-4 hover:underline"
                  >
                    {metric.label}
                    <ArrowRight
                      className="text-muted-foreground size-3"
                      aria-hidden
                    />
                  </Link>
                ) : (
                  <span className="font-medium">{metric.label}</span>
                )}
                <span className="ml-auto flex items-center gap-2">
                  <span className="tabular-nums">
                    {formatMetricValue(metric.value, metric.unit)}
                  </span>
                  <ConfidenceBadge
                    confidence={metric.confidence}
                    method={metric.method}
                  />
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {footer}
    </section>
  )
}
