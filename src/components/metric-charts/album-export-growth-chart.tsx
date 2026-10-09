import { ChartFrame, TimeSeriesChart } from '@/components/charts'
import { getMarketData, getSources } from '@/lib/data'
import { formatMetricValue } from '@/lib/format'
import { frameMeta } from './frame-props'

// 음반·DVD 수출 증가율(전년 대비) - 수출액에서 계산, 전년 또는 당해가 결측이면 결측
export async function AlbumExportGrowthChart() {
  const [{ albumExports: block }, sources] = await Promise.all([
    getMarketData(),
    getSources(),
  ])
  const data = block.points.slice(1).map((point, index) => {
    const prev = block.points[index].value
    const growth =
      point.value !== null && prev !== null && prev !== 0
        ? Math.round(((point.value - prev) / prev) * 1000) / 10
        : null
    return { year: point.year, growth }
  })

  return (
    <ChartFrame
      title="K팝 음반·DVD 수출 증가율"
      description="전년 대비 증감률 (단위: %)"
      method="연도별 수출액에서 (당해 − 전년) ÷ 전년으로 계산. 전년이나 당해 값이 없으면 계산하지 않음"
      {...frameMeta(block, sources)}
      table={{
        columns: ['연도', '증가율'],
        rows: data.map(row => [row.year, formatMetricValue(row.growth, '%')]),
      }}
    >
      <TimeSeriesChart
        data={data}
        xKey="year"
        series={[{ key: 'growth', label: '증가율' }]}
        unit="%"
      />
    </ChartFrame>
  )
}
