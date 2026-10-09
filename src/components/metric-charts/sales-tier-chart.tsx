import { BarChart, ChartFrame } from '@/components/charts'
import { NoticeBadge } from '@/components/confidence'
import { getConcentrationData, getSources } from '@/lib/data'
import { formatMetricValue } from '@/lib/format'
import { frameMeta } from './frame-props'

// 누적 판매 티어별 그룹 비율 - 손익분기점(30만 장)을 넘는 그룹의 희소성
export async function SalesTierChart() {
  const [{ survival: block }, sources] = await Promise.all([
    getConcentrationData(),
    getSources(),
  ])
  const data = block.tiers.map(tier => ({
    label: tier.label.replace('판매 ', ''),
    value: tier.value,
  }))

  return (
    <ChartFrame
      title="판매 티어별 그룹 비율"
      description="누적 판매량 구간에 도달한 그룹 비율 (단위: %)"
      notices={
        <NoticeBadge
          kind="sample"
          detail={`${block.sampleSize.toLocaleString('ko-KR')}개 그룹`}
        />
      }
      {...frameMeta(block, sources)}
      table={{
        columns: ['구간', '비율'],
        rows: block.tiers.map(tier => [
          tier.label,
          formatMetricValue(tier.value, tier.unit),
        ]),
      }}
    >
      <BarChart
        data={data}
        categoryKey="label"
        series={[{ key: 'value', label: '그룹 비율' }]}
        unit="%"
      />
    </ChartFrame>
  )
}
