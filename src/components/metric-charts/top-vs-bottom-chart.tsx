import { ChartFrame, TimeSeriesChart } from '@/components/charts'
import { getConcentrationData, getSources } from '@/lib/data'
import { formatMetricValue } from '@/lib/format'
import { frameMeta } from './frame-props'

// 1위 vs 100위 앨범 판매량 격차 - 두 값의 규모 차이가 커서 격차 배수를 그리고 원값은 표로 제공
export async function TopVsBottomChart() {
  const [{ topVsBottom: block }, sources] = await Promise.all([
    getConcentrationData(),
    getSources(),
  ])
  const data = block.points.map(point => ({
    year: point.year,
    ratio:
      point.hundredth > 0
        ? Math.round((point.first / point.hundredth) * 10) / 10
        : null,
  }))

  return (
    <ChartFrame
      title="1위 vs 100위 판매량 격차"
      description="연간 1위 앨범 판매량이 100위의 몇 배인지 (단위: 배)"
      method="1위 판매량 ÷ 100위 판매량"
      {...frameMeta(block, sources)}
      table={{
        columns: ['연도', '1위(장)', '100위(장)', '격차(배)'],
        rows: block.points.map((point, index) => [
          point.year,
          formatMetricValue(point.first, ''),
          formatMetricValue(point.hundredth, ''),
          formatMetricValue(data[index].ratio, ''),
        ]),
      }}
    >
      <TimeSeriesChart
        data={data}
        xKey="year"
        series={[{ key: 'ratio', label: '격차 배수' }]}
        unit="배"
      />
    </ChartFrame>
  )
}
