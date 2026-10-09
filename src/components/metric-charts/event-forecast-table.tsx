import { ChartFrame } from '@/components/charts'
import { getMarketData, getSources } from '@/lib/data'
import { formatMetricValue } from '@/lib/format'
import { frameMeta } from './frame-props'

// 조사기관별 K팝 공연(이벤트) 시장 전망 비교 - 기준·목표 연도가 달라 표로 비교
export async function EventForecastTable() {
  const [{ eventForecasts: block }, sources] = await Promise.all([
    getMarketData(),
    getSources(),
  ])

  return (
    <ChartFrame
      title="K팝 공연 시장 전망 (조사기관별)"
      description={`기관마다 기준 연도·전망 기간이 다릅니다 (단위: ${block.unit})`}
      {...frameMeta(block, sources)}
      table={{
        columns: ['조사기관', '기준', '전망', '기간', 'CAGR'],
        rows: block.rows.map(row => [
          row.institution,
          `${formatMetricValue(row.baseValue, '')} (${row.baseYear})`,
          `${formatMetricValue(row.targetValue, '')} (${row.targetYear})`,
          `${row.targetYear - row.baseYear}년`,
          formatMetricValue(row.cagr, '%'),
        ]),
      }}
    />
  )
}
