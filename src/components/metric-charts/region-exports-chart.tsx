import { BarChart, ChartFrame } from '@/components/charts'
import { NoticeBadge } from '@/components/confidence'
import { getGlobalData, getSources } from '@/lib/data'
import { formatMetricValue } from '@/lib/format'
import { frameMeta } from './frame-props'

// 지역별 방송콘텐츠 수출액 변화 (글로벌 확장, 서사 ③) - 음악 수출의 프록시
export async function RegionExportsChart() {
  const [{ regionExports: block }, sources] = await Promise.all([
    getGlobalData(),
    getSources(),
  ])
  const fromKey = `y${block.fromYear}`
  const toKey = `y${block.toYear}`
  const data = block.rows.map(row => ({
    region: row.region,
    [fromKey]: row.from,
    [toKey]: row.to,
  }))

  return (
    <ChartFrame
      title="지역별 수출액 변화"
      description={`${block.fromYear}년 → ${block.toYear}년 (단위: ${block.unit})`}
      notices={
        block.isProxy ? <NoticeBadge kind="proxy" detail={block.note} /> : null
      }
      {...frameMeta(block, sources)}
      table={{
        columns: ['지역', `${block.fromYear}년`, `${block.toYear}년`, '변화율'],
        rows: block.rows.map(row => [
          row.region,
          formatMetricValue(row.from, ''),
          formatMetricValue(row.to, ''),
          `${row.to >= row.from ? '+' : ''}${(((row.to - row.from) / row.from) * 100).toFixed(1)}%`,
        ]),
      }}
    >
      <BarChart
        data={data}
        categoryKey="region"
        series={[
          { key: fromKey, label: `${block.fromYear}년` },
          { key: toKey, label: `${block.toYear}년` },
        ]}
        unit={block.unit}
      />
    </ChartFrame>
  )
}
