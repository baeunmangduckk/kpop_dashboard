import { BarChart, ChartFrame } from '@/components/charts'
import { getConcentrationData, getSources } from '@/lib/data'
import { formatMetricValue } from '@/lib/format'
import { frameMeta } from './frame-props'

// Top100 총 판매량 - 2023년 정점 이후 감소
export async function TotalSalesChart() {
  const [{ totalSales: block }, sources] = await Promise.all([
    getConcentrationData(),
    getSources(),
  ])
  const data = block.points.map(point => ({
    year: String(point.year),
    total: point.total,
  }))

  return (
    <ChartFrame
      title="Top100 총 판매량"
      description="연간 앨범 판매량 상위 100개 합계 (단위: 장)"
      {...frameMeta(block, sources)}
      table={{
        columns: ['연도', '총 판매량(장)'],
        rows: data.map(row => [row.year, formatMetricValue(row.total, '')]),
      }}
    >
      <BarChart
        data={data}
        categoryKey="year"
        series={[{ key: 'total', label: '총 판매량' }]}
        unit="장"
      />
    </ChartFrame>
  )
}
