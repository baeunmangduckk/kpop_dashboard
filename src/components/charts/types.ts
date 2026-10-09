import type { ChartConfig } from '@/components/ui/chart'

// 차트 한 행: 범주(연도·회사 등) 키와 계열별 값, 결측은 null
export type ChartDatum = Record<string, string | number | null>

export interface ChartSeries {
  key: string
  label: string
  // 지정하지 않으면 계열 순서대로 --chart-1~8 (색은 순위가 아니라 대상을 따라가도록 호출 측에서 순서를 고정)
  color?: string
}

const MAX_SERIES = 8

export function seriesColor(series: ChartSeries, index: number): string {
  return series.color ?? `var(--chart-${(index % MAX_SERIES) + 1})`
}

// shadcn ChartContainer용 설정 - 계열 key별 라벨·색 (--color-{key} CSS 변수로 노출)
export function toChartConfig(series: ChartSeries[]): ChartConfig {
  if (series.length > MAX_SERIES) {
    throw new Error(
      `차트 계열은 최대 ${MAX_SERIES}개입니다. 나머지는 '기타'로 묶거나 차트를 나누세요.`
    )
  }
  return Object.fromEntries(
    series.map((item, index) => [
      item.key,
      { label: item.label, color: seriesColor(item, index) },
    ])
  )
}
