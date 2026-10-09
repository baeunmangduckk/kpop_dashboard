import type { ComponentType } from 'react'
import { AlbumExportsChart } from '@/components/metric-charts/album-exports-chart'
import { Big4RevenueChart } from '@/components/metric-charts/big4-revenue-chart'
import { RegionExportsChart } from '@/components/metric-charts/region-exports-chart'
import { ShareTrendChart } from '@/components/metric-charts/share-trend-chart'
import { SurvivalChart } from '@/components/metric-charts/survival-chart'
import { VirtualMarketPathChart } from '@/components/metric-charts/virtual-market-path-chart'
import type { NarrativeSlug } from '@/lib/schemas'

// 서사 문단(순서)별 인라인 차트 - 문단 내용이 바뀌면 함께 조정
export const SECTION_CHARTS: Record<NarrativeSlug, ComponentType[]> = {
  slowdown: [Big4RevenueChart, AlbumExportsChart],
  polarization: [ShareTrendChart, SurvivalChart],
  realignment: [RegionExportsChart, VirtualMarketPathChart],
}
