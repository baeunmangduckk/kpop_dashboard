'use client'

import type { TooltipContentProps } from 'recharts'
import { formatMetricValue } from '@/lib/format'
import type { ChartSeries } from './types'
import { seriesColor } from './types'

type ValueTooltipProps = Partial<TooltipContentProps<number, string>> & {
  series: ChartSeries[]
  unit: string
}

// 계열 순서대로 값과 단위를 표시하는 툴팁 (결측은 '결측'으로 명시)
export function ValueTooltip({
  active,
  label,
  payload,
  series,
  unit,
}: ValueTooltipProps) {
  if (!active || !payload?.length) return null
  const row = payload[0]?.payload as Record<string, unknown> | undefined

  return (
    <div className="border-border/50 bg-background grid min-w-[9rem] gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl">
      <p className="font-medium">{String(label)}</p>
      {series.map((item, index) => {
        const raw = row?.[item.key]
        const value = typeof raw === 'number' ? raw : null
        return (
          <div key={item.key} className="flex items-center gap-2">
            <span
              aria-hidden
              className="size-2.5 shrink-0 rounded-[2px]"
              style={{ backgroundColor: seriesColor(item, index) }}
            />
            <span className="text-muted-foreground flex-1">{item.label}</span>
            <span className="text-foreground font-mono font-medium tabular-nums">
              {formatMetricValue(value, unit)}
            </span>
          </div>
        )
      })}
    </div>
  )
}
