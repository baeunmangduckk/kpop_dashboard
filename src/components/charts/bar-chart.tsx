'use client'

import {
  Bar,
  CartesianGrid,
  BarChart as RechartsBarChart,
  ReferenceLine,
  XAxis,
  YAxis,
} from 'recharts'
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

interface BarChartProps {
  data: ChartDatum[]
  categoryKey: string
  series: ChartSeries[]
  unit: string
  // column: 세로 막대(기본), row: 가로 막대(긴 범주명·순위)
  orientation?: 'column' | 'row'
  className?: string
}

// 막대 차트 - 계열 여러 개면 묶은 막대, 음수(적자)는 0 기준선 아래로
export function BarChart({
  data,
  categoryKey,
  series,
  unit,
  orientation = 'column',
  className,
}: BarChartProps) {
  const isRow = orientation === 'row'
  const hasNegative = data.some(row =>
    series.some(item => {
      const value = row[item.key]
      return typeof value === 'number' && value < 0
    })
  )
  const categoryAxis = {
    dataKey: categoryKey,
    type: 'category' as const,
    tickLine: false,
    axisLine: false,
    tickMargin: 8,
  }
  const valueAxis = {
    type: 'number' as const,
    tickLine: false,
    axisLine: false,
    tickFormatter: formatCompact,
  }

  return (
    <ChartContainer
      config={toChartConfig(series)}
      className={cn(
        'aspect-auto w-full',
        isRow ? 'h-72 sm:h-80' : 'h-60 sm:h-72',
        className
      )}
    >
      <RechartsBarChart
        data={data}
        layout={isRow ? 'vertical' : 'horizontal'}
        barGap={2}
        barCategoryGap="20%"
        margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
      >
        <CartesianGrid
          horizontal={!isRow}
          vertical={isRow}
          strokeDasharray="3 3"
        />
        {isRow ? (
          <>
            <XAxis {...valueAxis} />
            <YAxis {...categoryAxis} width={88} />
          </>
        ) : (
          <>
            {/* 범주(회사 등)는 생략하지 않고 모두 표시 */}
            <XAxis {...categoryAxis} interval={0} />
            <YAxis {...valueAxis} width={44} />
          </>
        )}
        {hasNegative &&
          (isRow ? (
            <ReferenceLine x={0} stroke="var(--muted-foreground)" />
          ) : (
            <ReferenceLine y={0} stroke="var(--muted-foreground)" />
          ))}
        <ChartTooltip
          cursor={{ fill: 'var(--muted)', opacity: 0.5 }}
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
          <Bar
            key={item.key}
            dataKey={item.key}
            name={item.key}
            fill={`var(--color-${item.key})`}
            // 값 쪽 끝만 둥글게 (음수 막대는 Recharts가 방향을 뒤집어 아래쪽 끝이 둥글어짐)
            radius={isRow ? [0, 4, 4, 0] : [4, 4, 0, 0]}
            maxBarSize={40}
            isAnimationActive={false}
          />
        ))}
      </RechartsBarChart>
    </ChartContainer>
  )
}
