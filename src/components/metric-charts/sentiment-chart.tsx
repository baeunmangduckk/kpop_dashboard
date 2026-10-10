import {
  ChartFrame,
  DistributionChart,
  type ChartSeries,
} from '@/components/charts'
import { NoticeBadge } from '@/components/confidence'
import { getFansData, getSources } from '@/lib/data'
import { frameMeta } from './frame-props'

// 감성은 색에 뜻이 실리므로 순서 색 대신 지정: 긍정 파랑, 중립 회색, 부정 주황
const SERIES: ChartSeries[] = [
  { key: 'positive', label: '긍정', color: 'var(--chart-1)' },
  {
    key: 'neutral',
    label: '중립',
    color: 'color-mix(in oklab, var(--muted-foreground) 55%, transparent)',
  },
  { key: 'negative', label: '부정', color: 'var(--chart-2)' },
]

type SentimentKey = 'positive' | 'neutral' | 'negative'

interface Row {
  label: string
  sampleSize: number
  positive: number
  neutral: number
  negative: number
}

const share = (value: number, total: number) =>
  `${((value / total) * 100).toFixed(1)}%`

// 댓글 감성 분포 - 전체와 영상별, 표본 수·수집일을 항상 함께 표기
export async function SentimentChart() {
  const [{ sentiment: block, videos }, sources] = await Promise.all([
    getFansData(),
    getSources(),
  ])
  const labelOf = new Map(
    videos.items.map(video => [video.id, video.artist ?? '기준 영상'])
  )
  const rows: Row[] = [
    { label: '전체', ...block },
    // 긍정 비율이 높은 영상부터
    ...block.byVideo
      .map(item => ({
        ...item,
        label: labelOf.get(item.videoId) ?? item.videoId,
      }))
      .sort((a, b) => b.positive / b.sampleSize - a.positive / a.sampleSize),
  ]

  return (
    <ChartFrame
      title="댓글 감성 분포"
      description={block.note}
      method={block.method}
      notices={
        <NoticeBadge
          kind="sample"
          detail={`n=${block.sampleSize.toLocaleString('ko-KR')} · 영상 ${block.byVideo.length}개 · ${block.collectedAt} 수집`}
        />
      }
      {...frameMeta(block, sources)}
      asOf={block.collectedAt}
      table={{
        columns: ['구분', '댓글 수', '긍정', '중립', '부정'],
        rows: rows.map(row => [
          row.label,
          row.sampleSize,
          ...SERIES.map(
            item =>
              `${row[item.key as SentimentKey]} (${share(row[item.key as SentimentKey], row.sampleSize)})`
          ),
        ]),
      }}
    >
      <DistributionChart
        data={rows.map(row => ({
          label: row.label,
          positive: row.positive,
          neutral: row.neutral,
          negative: row.negative,
        }))}
        categoryKey="label"
        series={SERIES}
      />
    </ChartFrame>
  )
}
