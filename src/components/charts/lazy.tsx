'use client'

import dynamic from 'next/dynamic'
import type { CSSProperties } from 'react'
import { cn } from '@/lib/utils'

// Recharts(약 130kB)를 첫 화면 번들에서 떼어 내 차트가 보일 때 따로 내려받는다.
// 같은 데이터가 '표로 보기'에 서버 렌더링되므로 차트는 클라이언트에서만 그려도 내용 손실이 없다.

interface PlaceholderProps {
  className?: string
  style?: CSSProperties
}

// 차트와 같은 높이를 미리 차지해 로딩 중 레이아웃이 밀리지 않게 함
function ChartPlaceholder({ className, style }: PlaceholderProps) {
  return (
    <div
      className={cn('bg-muted/40 w-full animate-pulse rounded-lg', className)}
      style={style}
    />
  )
}

export const TimeSeriesChart = dynamic(
  () => import('./time-series-chart').then(mod => mod.TimeSeriesChart),
  {
    ssr: false,
    loading: () => <ChartPlaceholder className="h-60 sm:h-72" />,
  }
)

export const BarChart = dynamic(
  () => import('./bar-chart').then(mod => mod.BarChart),
  {
    ssr: false,
    // 가로 막대(row)가 조금 더 높지만 차이가 작아 세로 막대 높이로 통일
    loading: () => <ChartPlaceholder className="h-60 sm:h-72" />,
  }
)

export const DistributionChart = dynamic(
  () => import('./distribution-chart').then(mod => mod.DistributionChart),
  {
    ssr: false,
    loading: () => <ChartPlaceholder style={{ height: 96 }} />,
  }
)
