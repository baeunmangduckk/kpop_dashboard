'use client'

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'
import { NoticeBadge } from '@/components/confidence'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
} from '@/components/ui/chart'
import { formatCompact } from '@/lib/format'
import { cn } from '@/lib/utils'
import { ValueTooltip } from './chart-tooltip'
import { toChartConfig, type ChartDatum, type ChartSeries } from './types'

interface TimeSeriesChartProps {
  data: ChartDatum[]
  xKey: string
  series: ChartSeries[]
  unit: string
  className?: string
}

// 시계열 선 차트 - 결측(null)은 선을 잇지 않고 끊어서 표시
export function TimeSeriesChart({
  data,
  xKey,
  series,
  unit,
  className,
}: TimeSeriesChartProps) {
  // x가 숫자(연도)면 연속 축으로 그려 연도 간격(2011→2017 등)을 실제 거리대로 표시
  const xValues = data.map(row => row[xKey])
  const isNumericX = xValues.every(value => typeof value === 'number')
  const numericTicks = isNumericX
    ? xValues.filter((value): value is number => typeof value === 'number')
    : undefined

  const missing = data
    .filter(row => series.some(item => row[item.key] === null))
    .map(row => String(row[xKey]))

  return (
    <div className="space-y-2">
      <ChartContainer
        config={toChartConfig(series)}
        className={cn('aspect-auto h-60 w-full sm:h-72', className)}
      >
        <LineChart
          data={data}
          margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
        >
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey={xKey}
            type={isNumericX ? 'number' : 'category'}
            domain={isNumericX ? ['dataMin', 'dataMax'] : undefined}
            ticks={numericTicks}
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={16}
            interval="preserveStartEnd"
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={44}
            tickFormatter={formatCompact}
          />
          <ChartTooltip
            cursor={{ strokeDasharray: '4 4' }}
            content={<ValueTooltip series={series} unit={unit} />}
          />
          {series.length > 1 && (
            <ChartLegend
              // 계열 순서 유지 (Recharts 3 기본값은 이름순 정렬)
              itemSorter={null}
              content={<ChartLegendContent className="flex-wrap" />}
            />
          )}
          {series.map(item => (
            <Line
              key={item.key}
              dataKey={item.key}
              name={item.key}
              type="linear"
              stroke={`var(--color-${item.key})`}
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 0, fill: `var(--color-${item.key})` }}
              activeDot={{ r: 5, stroke: 'var(--card)', strokeWidth: 2 }}
              connectNulls={false}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ChartContainer>
      {missing.length > 0 && (
        <NoticeBadge
          kind="missing"
          detail={`${missing.join('·')} 원자료 없음 — 선이 끊겨 표시됩니다`}
        />
      )}
    </div>
  )
}
