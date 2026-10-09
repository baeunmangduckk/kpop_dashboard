import {
  ChartFrame,
  DistributionChart,
  type ChartSeries,
} from '@/components/charts'
import { NoticeBadge } from '@/components/confidence'
import { getFansData, getSources } from '@/lib/data'
import { frameMeta } from './frame-props'

const SERIES: ChartSeries[] = [
  { key: 'positive', label: '긍정' },
  { key: 'neutral', label: '중립' },
  { key: 'negative', label: '부정' },
]

// 댓글 감성 분포 - 표본 수·수집일을 항상 함께 표기
export async function SentimentChart() {
  const [{ sentiment: block }, sources] = await Promise.all([
    getFansData(),
    getSources(),
  ])
  const count = (key: string) =>
    block[key as 'positive' | 'neutral' | 'negative']

  return (
    <ChartFrame
      title="댓글 감성 분포"
      description={block.note}
      method="수집 댓글을 긍정·중립·부정으로 자동 분류"
      notices={
        <NoticeBadge
          kind="sample"
          detail={`n=${block.sampleSize} · ${block.collectedAt} 수집`}
        />
      }
      {...frameMeta(block, sources)}
      asOf={block.collectedAt}
      table={{
        columns: ['구분', '댓글 수', '비율'],
        rows: SERIES.map(item => [
          item.label,
          count(item.key),
          `${((count(item.key) / block.sampleSize) * 100).toFixed(1)}%`,
        ]),
      }}
    >
      <DistributionChart
        data={[
          {
            label: '감성',
            positive: block.positive,
            neutral: block.neutral,
            negative: block.negative,
          },
        ]}
        categoryKey="label"
        series={SERIES}
      />
    </ChartFrame>
  )
}
