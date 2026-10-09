import { BarChart, ChartFrame } from '@/components/charts'
import { NoticeBadge } from '@/components/confidence'
import { getConcentrationData, getSources } from '@/lib/data'
import { formatMetricValue } from '@/lib/format'
import { frameMeta } from './frame-props'

// 데뷔 그룹 생존율 (판매 집중도, 서사 ②)
export async function SurvivalChart() {
  const [{ survival: block }, sources] = await Promise.all([
    getConcentrationData(),
    getSources(),
  ])
  const data = block.rates.map(rate => ({
    label: rate.label.replace(' 생존율', ''),
    value: rate.value,
  }))

  return (
    <ChartFrame
      title="데뷔 그룹 생존율"
      description="데뷔 후 해당 기간까지 활동을 이어간 그룹 비율 (단위: %)"
      notices={
        <NoticeBadge
          kind="sample"
          detail={`${block.sampleSize.toLocaleString('ko-KR')}개 그룹${block.note ? ` · ${block.note}` : ''}`}
        />
      }
      {...frameMeta(block, sources)}
      table={{
        columns: ['구분', '비율'],
        rows: [...block.rates, ...block.tiers].map(row => [
          row.label,
          formatMetricValue(row.value, row.unit),
        ]),
      }}
    >
      <BarChart
        data={data}
        categoryKey="label"
        series={[{ key: 'value', label: '생존율' }]}
        unit="%"
      />
    </ChartFrame>
  )
}
