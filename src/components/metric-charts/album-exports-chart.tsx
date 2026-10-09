import { ChartFrame, TimeSeriesChart } from '@/components/charts'
import { getMarketData, getSources } from '@/lib/data'
import { formatMetricValue } from '@/lib/format'
import { frameMeta } from './frame-props'

// K팝 음반·DVD 수출액 추이 (시장 전망, 서사 ①)
export async function AlbumExportsChart() {
  const [{ albumExports: block }, sources] = await Promise.all([
    getMarketData(),
    getSources(),
  ])
  const data = block.points.map(point => ({
    year: point.year,
    value: point.value,
  }))

  return (
    <ChartFrame
      title="K팝 음반·DVD 수출액 추이"
      description={`단위: ${block.unit}`}
      {...frameMeta(block, sources)}
      table={{
        columns: ['연도', `수출액(${block.unit})`],
        rows: data.map(row => [row.year, formatMetricValue(row.value, '')]),
      }}
    >
      <TimeSeriesChart
        data={data}
        xKey="year"
        series={[{ key: 'value', label: '수출액' }]}
        unit={block.unit}
      />
    </ChartFrame>
  )
}
