import { BarChart, ChartFrame } from '@/components/charts'
import { getFinanceData, getSources } from '@/lib/data'
import { formatMetricValue } from '@/lib/format'
import { resolveSources } from '@/lib/sources'

// 상장 4사 합산 매출액·영업이익 연도별 (기획사 재무, 서사 ①) - 회사별 공시값 합산
export async function Big4RevenueChart() {
  const [finance, sources] = await Promise.all([getFinanceData(), getSources()])
  const majors = new Set(
    finance.companies
      .filter(company => company.tier === 'major')
      .map(company => company.name)
  )
  const rows = finance.financials.filter(row => majors.has(row.company))
  const years = [...new Set(rows.map(row => row.year))].sort()
  const sum = (values: (number | null)[]) =>
    values.some(value => value === null)
      ? null
      : values.reduce<number>((total, value) => total + (value ?? 0), 0)
  const data = years.map(year => {
    const ofYear = rows.filter(row => row.year === year)
    return {
      year: `${year}년`,
      revenue: sum(ofYear.map(row => row.revenue)),
      operatingProfit: sum(ofYear.map(row => row.operatingProfit)),
    }
  })
  const allVerified = rows.every(row => row.confidence === 'verified')
  const sourceIds = [...new Set(rows.flatMap(row => row.sourceIds))]

  return (
    <ChartFrame
      title="상장 4사 합산 실적"
      description="하이브·SM·YG·JYP 연결 기준 합산 (단위: 억원)"
      confidence={allVerified ? 'verified' : 'estimated'}
      sources={resolveSources(sourceIds, sources)}
      table={{
        columns: ['연도', '매출액(억원)', '영업이익(억원)'],
        rows: data.map(row => [
          row.year,
          formatMetricValue(row.revenue, ''),
          formatMetricValue(row.operatingProfit, ''),
        ]),
      }}
    >
      <BarChart
        data={data}
        categoryKey="year"
        series={[
          { key: 'revenue', label: '매출액' },
          { key: 'operatingProfit', label: '영업이익' },
        ]}
        unit="억원"
      />
    </ChartFrame>
  )
}
