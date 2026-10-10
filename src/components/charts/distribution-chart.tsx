'use client'

import { Bar, BarChart as RechartsBarChart, XAxis, YAxis } from 'recharts'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
} from '@/components/ui/chart'
import { cn } from '@/lib/utils'
import { ValueTooltip } from './chart-tooltip'
import { toChartConfig, type ChartDatum, type ChartSeries } from './types'

interface DistributionChartProps {
  // 각 행의 계열 값은 개수 또는 비율 (행마다 합계 기준 100%로 환산)
  data: ChartDatum[]
  categoryKey: string
  series: ChartSeries[]
  className?: string
}

// 100% 누적 가로 막대 - 전체 대비 구성비(감성 분포 등)
export function DistributionChart({
  data,
  categoryKey,
  series,
  className,
}: DistributionChartProps) {
  const percentData = data.map(row => {
    const total = series.reduce((sum, item) => {
      const value = row[item.key]
      return sum + (typeof value === 'number' ? value : 0)
    }, 0)
    const shares = Object.fromEntries(
      series.map(item => {
        const value = row[item.key]
        const share =
          typeof value === 'number' && total > 0 ? (value / total) * 100 : 0
        return [item.key, Math.round(share * 10) / 10]
      })
    )
    return { [categoryKey]: row[categoryKey], ...shares }
  })

  // 행이 하나면 범례에 비율을 함께 적어 직접 라벨 역할 (구간 안 흰 글씨는 밝은 계열에서 대비 부족)
  const legendSeries =
    percentData.length === 1
      ? series.map(item => ({
          ...item,
          label: `${item.label} ${percentData[0][item.key]}%`,
        }))
      : series

  return (
    <ChartContainer
      config={toChartConfig(legendSeries)}
      className={cn('aspect-auto w-full', className)}
      style={{ height: Math.max(96, percentData.length * 48 + 48) }}
    >
      <RechartsBarChart
        // 차트 영역은 aria-hidden(표가 대체 수단)이므로 키보드 초점도 받지 않게 함
        accessibilityLayer={false}
        data={percentData}
        layout="vertical"
        stackOffset="expand"
        margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
      >
        <XAxis type="number" hide domain={[0, 1]} />
        <YAxis
          dataKey={categoryKey}
          type="category"
          tickLine={false}
          axisLine={false}
          width={data.length > 1 ? 96 : 0}
          interval={0}
          hide={data.length <= 1}
        />
        <ChartTooltip
          cursor={false}
          content={<ValueTooltip series={series} unit="%" />}
        />
        <ChartLegend
          // 계열 순서 유지 (Recharts 3 기본값은 이름순 정렬)
          itemSorter={null}
          content={<ChartLegendContent className="flex-wrap" />}
        />
        {series.map((item, index) => (
          <Bar
            key={item.key}
            dataKey={item.key}
            name={item.key}
            stackId="share"
            fill={`var(--color-${item.key})`}
            // 구간 사이 2px 표면색 간격
            stroke="var(--card)"
            strokeWidth={2}
            radius={
              index === 0
                ? [4, 0, 0, 4]
                : index === series.length - 1
                  ? [0, 4, 4, 0]
                  : 0
            }
            barSize={28}
            isAnimationActive={false}
          />
        ))}
      </RechartsBarChart>
    </ChartContainer>
  )
}
