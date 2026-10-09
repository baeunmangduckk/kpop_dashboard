import Link from 'next/link'
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import {
  formatDelta,
  formatMetricValue,
  type DeltaDirection,
} from '@/lib/format'
import type { Metric, Source } from '@/lib/schemas'
import { cn } from '@/lib/utils'
import { ConfidenceBadge } from './confidence-badge'
import { NoticeBadge } from './notice-badge'
import { SourceCitation } from './source-citation'

const DELTA_ICON = {
  up: ArrowUpRight,
  down: ArrowDownRight,
  flat: Minus,
} satisfies Record<DeltaDirection, typeof Minus>

const DELTA_LABEL: Record<DeltaDirection, string> = {
  up: '증가',
  down: '감소',
  flat: '변동 없음',
}

interface KpiCardProps {
  metric: Metric
  sources: Source[]
  // 지표 페이지 경로 (있으면 지표명이 상세 링크가 됨)
  href?: string
  className?: string
}

// 핵심 지표 카드 - 값·전기 대비·신뢰도 배지·출처를 한 단위로 표시
export function KpiCard({ metric, sources, href, className }: KpiCardProps) {
  const delta = formatDelta(metric.delta, metric.unit)
  const DeltaIcon = delta ? DELTA_ICON[delta.direction] : null

  return (
    <Card
      data-metric-id={metric.id}
      className={cn('gap-3 py-5', href && 'hover:border-ring/60', className)}
    >
      <CardHeader className="flex items-start justify-between gap-2 px-5">
        <h3 className="text-muted-foreground text-sm leading-snug font-medium">
          {href ? (
            <Link
              href={href}
              className="hover:text-foreground underline-offset-4 hover:underline"
            >
              {metric.label}
            </Link>
          ) : (
            metric.label
          )}
        </h3>
        <ConfidenceBadge
          confidence={metric.confidence}
          method={metric.method}
        />
      </CardHeader>
      <CardContent className="space-y-1 px-5">
        <p className="text-2xl font-bold tracking-tight break-keep">
          {formatMetricValue(metric.value, metric.unit)}
        </p>
        {metric.value === null && <NoticeBadge kind="missing" />}
        {delta && DeltaIcon && (
          <p className="text-muted-foreground flex items-center gap-1 text-sm">
            <DeltaIcon className="size-4" aria-hidden />
            <span className="sr-only">
              전기 대비 {DELTA_LABEL[delta.direction]}
            </span>
            {delta.text}
          </p>
        )}
        {metric.note && (
          <p className="text-muted-foreground text-xs">{metric.note}</p>
        )}
      </CardContent>
      <CardFooter className="px-5">
        <SourceCitation sources={sources} asOf={metric.asOf} />
      </CardFooter>
    </Card>
  )
}
