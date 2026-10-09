import { BarChart, ChartFrame } from '@/components/charts'
import { NoticeBadge } from '@/components/confidence'
import { getGlobalData, getSources } from '@/lib/data'
import { frameMeta } from './frame-props'

// 국가별 K-pop 검색 관심도 (Google Trends 상대지수) - Task 014 전까지 더미
export async function CountryInterestChart() {
  const [{ countryInterest: block }, sources] = await Promise.all([
    getGlobalData(),
    getSources(),
  ])
  const rows = [...block.rows].sort((a, b) => b.interest - a.interest)

  return (
    <ChartFrame
      title={`국가별 '${block.keyword}' 검색 관심도`}
      description="기간 내 최댓값을 100으로 둔 상대지수 (절대 검색량 아님)"
      notices={
        <>
          {block.isDummy && <NoticeBadge kind="dummy" detail={block.note} />}
          <NoticeBadge kind="relative" detail="최댓값 100 기준" />
        </>
      }
      {...frameMeta(block, sources)}
      table={{
        columns: ['국가', '관심도'],
        rows: rows.map(row => [row.country, row.interest]),
      }}
    >
      <BarChart
        data={rows.map(row => ({
          country: row.country,
          interest: row.interest,
        }))}
        categoryKey="country"
        series={[{ key: 'interest', label: '관심도' }]}
        unit=""
        orientation="row"
      />
    </ChartFrame>
  )
}
