import { ChartFrame } from '@/components/charts'
import { getConcentrationData, getSources } from '@/lib/data'
import { formatMetricValue } from '@/lib/format'
import { frameMeta } from './frame-props'

// 대기업 vs 중소기업 자본·인프라 격차 - 항목별 단위가 달라 표로 비교
export async function CapitalGapTable() {
  const [{ capitalGap: block }, sources] = await Promise.all([
    getConcentrationData(),
    getSources(),
  ])

  return (
    <ChartFrame
      title="대기업 vs 중소기업 격차"
      description={`${block.baseYear}년 기준`}
      {...frameMeta(block, sources)}
      table={{
        columns: ['항목', '대기업', '중소기업', '격차'],
        rows: block.rows.map(row => [
          row.label,
          formatMetricValue(row.large, row.unit),
          formatMetricValue(row.small, row.unit),
          row.small > 0 ? `약 ${(row.large / row.small).toFixed(1)}배` : '—',
        ]),
      }}
    />
  )
}
