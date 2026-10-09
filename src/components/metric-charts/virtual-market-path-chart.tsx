import { ChartFrame, TimeSeriesChart } from '@/components/charts'
import { getAiVirtualData, getSources } from '@/lib/data'
import { formatMetricValue } from '@/lib/format'
import { frameMeta } from './frame-props'

// 버추얼 아이돌 시장 전망 경로 (AI·버추얼, 서사 ③) - CAGR 복리 추정
export async function VirtualMarketPathChart() {
  const [{ marketPath: block }, sources] = await Promise.all([
    getAiVirtualData(),
    getSources(),
  ])
  const data = block.points.map(point => ({ ...point }))

  return (
    <ChartFrame
      title="버추얼 아이돌 시장 전망 경로"
      description={`단위: ${block.unit} · CAGR ${block.cagr}% 가정`}
      method={block.note}
      {...frameMeta(block, sources)}
      table={{
        columns: ['연도', `시장 규모(${block.unit})`],
        rows: data.map(row => [row.year, formatMetricValue(row.value, '')]),
      }}
    >
      <TimeSeriesChart
        data={data}
        xKey="year"
        series={[{ key: 'value', label: '시장 규모(추정)' }]}
        unit={block.unit}
      />
    </ChartFrame>
  )
}
