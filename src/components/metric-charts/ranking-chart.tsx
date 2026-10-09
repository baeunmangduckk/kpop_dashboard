import { BarChart, ChartFrame } from '@/components/charts'
import { formatMetricValue } from '@/lib/format'
import type { Ranking, Source } from '@/lib/schemas'
import { frameMeta } from './frame-props'

interface RankingChartProps {
  ranking: Ranking
  sources: Source[]
}

// 아티스트 순위 (팔로워·청취자·구독자) - 순위형 비교라 가로 막대
export function RankingChart({ ranking, sources }: RankingChartProps) {
  const rows = [...ranking.rows].sort((a, b) => b.value - a.value)

  return (
    <ChartFrame
      title={ranking.title}
      description={`단위: ${ranking.unit}${ranking.note ? ` · ${ranking.note}` : ''}`}
      {...frameMeta(ranking, sources)}
      table={{
        columns: ['순위', '아티스트', ranking.unit],
        rows: rows.map((row, index) => [
          index + 1,
          row.artist,
          formatMetricValue(row.value, ''),
        ]),
      }}
    >
      <BarChart
        data={rows.map(row => ({ artist: row.artist, value: row.value }))}
        categoryKey="artist"
        series={[{ key: 'value', label: ranking.title }]}
        unit={ranking.unit}
        orientation="row"
      />
    </ChartFrame>
  )
}
