import { BarChart, ChartFrame } from '@/components/charts'
import { getFinanceData, getSources } from '@/lib/data'
import { formatMetricValue } from '@/lib/format'
import { frameMeta } from './frame-props'

// 대형 vs 중소 상장 기획사 분기 매출 - 순위형 비교라 가로 막대
export async function QuarterlyRevenueChart() {
  const [{ quarterlyRevenue: block }, sources] = await Promise.all([
    getFinanceData(),
    getSources(),
  ])
  const data = block.rows.map(row => ({
    company: row.company.replace('엔터테인먼트', ''),
    revenue: row.revenue,
  }))
  const top = block.rows[0]
  const bottom = block.rows[block.rows.length - 1]

  return (
    <ChartFrame
      title={`${block.period} 상장 기획사 매출`}
      description={`단위: ${block.unit} · ${top.company}는 ${bottom.company}의 약 ${Math.round(top.revenue / bottom.revenue)}배`}
      method="분기 보도·분석 자료 기준 추정 매출"
      {...frameMeta(block, sources)}
      table={{
        columns: ['회사', `매출(${block.unit})`],
        rows: block.rows.map(row => [
          row.company,
          formatMetricValue(row.revenue, ''),
        ]),
      }}
    >
      <BarChart
        data={data}
        categoryKey="company"
        series={[{ key: 'revenue', label: '분기 매출' }]}
        unit={block.unit}
        orientation="row"
      />
    </ChartFrame>
  )
}
