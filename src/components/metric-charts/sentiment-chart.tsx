import { getFansData, getSources } from '@/lib/data'
import { frameMeta } from './frame-props'
import { SentimentWords, type SentimentCounts } from './sentiment-words'

const sum = (rows: SentimentCounts[]): SentimentCounts =>
  rows.reduce(
    (total, row) => ({
      sampleSize: total.sampleSize + row.sampleSize,
      positive: total.positive + row.positive,
      neutral: total.neutral + row.neutral,
      negative: total.negative + row.negative,
    }),
    { sampleSize: 0, positive: 0, neutral: 0, negative: 0 }
  )

// 댓글 감성 워드 클라우드 - 표본 수·수집일을 항상 함께 표기
export async function SentimentChart() {
  const [{ sentiment: block, videos }, sources] = await Promise.all([
    getFansData(),
    getSources(),
  ])
  const referenceIds = new Set(
    videos.items.filter(video => video.kind === 'reference').map(v => v.id)
  )
  const meta = frameMeta(block, sources)

  return (
    <SentimentWords
      words={block.words}
      totals={{
        all: block,
        mv: sum(block.byVideo.filter(item => !referenceIds.has(item.videoId))),
        reference: sum(
          block.byVideo.filter(item => referenceIds.has(item.videoId))
        ),
      }}
      description={block.note ?? ''}
      method={block.method}
      collectedAt={block.collectedAt}
      videoCount={block.byVideo.length}
      confidence={meta.confidence}
      sources={meta.sources}
    />
  )
}
