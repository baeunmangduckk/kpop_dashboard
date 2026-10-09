import { ChartFrame, TimeSeriesChart } from '@/components/charts'
import { getConcentrationData, getSources } from '@/lib/data'
import { frameMeta } from './frame-props'

// 판매량 집중도(Gini) 추이 - 0=균등, 1=한 앨범에 쏠림
export async function GiniTrendChart() {
  const [{ giniTrend: block }, sources] = await Promise.all([
    getConcentrationData(),
    getSources(),
  ])

  return (
    <ChartFrame
      title="판매량 집중도(Gini) 추이"
      description="0에 가까울수록 판매가 고르게 분산됩니다"
      {...frameMeta(block, sources)}
      table={{
        columns: ['연도', 'Gini'],
        rows: block.points.map(point => [point.year, point.gini.toFixed(2)]),
      }}
    >
      <TimeSeriesChart
        data={block.points.map(point => ({ ...point }))}
        xKey="year"
        series={[{ key: 'gini', label: 'Gini' }]}
        unit=""
      />
    </ChartFrame>
  )
}
