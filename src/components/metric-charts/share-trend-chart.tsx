import {
  ChartFrame,
  TimeSeriesChart,
  type ChartSeries,
} from '@/components/charts'
import { getConcentrationData, getSources } from '@/lib/data'
import { formatMetricValue } from '@/lib/format'
import { frameMeta } from './frame-props'

const SERIES: ChartSeries[] = [
  { key: 'top10', label: 'Top10' },
  { key: 'top20', label: 'Top20' },
  { key: 'bottom50', label: '하위50' },
]

// Top 앨범 판매 점유율 추이 (판매 집중도, 서사 ②)
export async function ShareTrendChart() {
  const [{ shareTrend: block }, sources] = await Promise.all([
    getConcentrationData(),
    getSources(),
  ])

  return (
    <ChartFrame
      title="Top 앨범 판매 점유율 추이"
      description="Top100 판매량 중 상위 10·20위와 하위 50위가 차지하는 비중 (단위: %)"
      {...frameMeta(block, sources)}
      table={{
        columns: ['연도', ...SERIES.map(item => item.label)],
        rows: block.points.map(point => [
          point.year,
          formatMetricValue(point.top10, '%'),
          formatMetricValue(point.top20, '%'),
          formatMetricValue(point.bottom50, '%'),
        ]),
      }}
    >
      <TimeSeriesChart
        data={block.points.map(point => ({ ...point }))}
        xKey="year"
        series={SERIES}
        unit="%"
      />
    </ChartFrame>
  )
}
