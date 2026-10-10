// 파이썬 감성 분석 결과(data/derived/youtube-sentiment.json) → fans.json 반영
// 실행: npm run apply:sentiment [-- "검수 메모"]
import path from 'node:path'
import { z } from 'zod'
import { fansDataSchema } from '../../src/lib/schemas'
import { PUBLIC_DATA_DIR, fileExists, readJson, writeJson } from './lib/io'

const DERIVED = path.join(
  process.cwd(),
  'data',
  'derived',
  'youtube-sentiment.json'
)
const REVIEW = path.join(
  process.cwd(),
  'data',
  'derived',
  'youtube-sentiment-review.json'
)
const SOURCE_ID = 'youtube-data-api'

const count = z.number().int().nonnegative()
const derivedSchema = z.object({
  model: z.string().min(1),
  analyzedAt: z.iso.date(),
  collectedAt: z.iso.date(),
  sampleSize: count.positive(),
  positive: count,
  neutral: count,
  negative: count,
  videos: z
    .array(
      z.object({
        videoId: z.string().min(1),
        sampleSize: count.positive(),
        positive: count,
        neutral: count,
        negative: count,
      })
    )
    .min(1),
})

// 사람이 읽고 매긴 라벨과의 비교 결과 (없으면 산출 방식에서 생략)
const reviewSchema = z.object({ summary: z.string().min(1) })

async function main() {
  if (!(await fileExists(DERIVED))) {
    console.error(
      'data/derived/youtube-sentiment.json이 없습니다.\n먼저 .venv/Scripts/python scripts/analyze/sentiment.py 를 실행하세요.'
    )
    process.exit(1)
  }
  const derived = await readJson(DERIVED, derivedSchema)
  const review = (await fileExists(REVIEW))
    ? (await readJson(REVIEW, reviewSchema)).summary
    : null
  const fansFile = path.join(PUBLIC_DATA_DIR, 'fans.json')
  // 스키마가 바뀌는 첫 반영에서도 읽을 수 있도록 sentiment만 느슨하게 검증
  const fans = await readJson(
    fansFile,
    fansDataSchema.extend({ sentiment: z.unknown() })
  )

  const known = new Set(fans.videos.items.map(video => video.id))
  const unknown = derived.videos.filter(video => !known.has(video.videoId))
  if (unknown.length > 0) {
    throw new Error(
      `영상 표본에 없는 videoId: ${unknown.map(video => video.videoId).join(', ')}`
    )
  }

  const sentiment = {
    confidence: 'estimated' as const,
    sourceIds: [SOURCE_ID],
    asOf: derived.analyzedAt,
    note: `영상 ${derived.videos.length}개에서 관련성순 상위 댓글을 최대 100개씩 모은 표본으로, 인기 댓글에 치우쳐 있고 산업 전체 여론을 대표하지 않음`,
    sampleSize: derived.sampleSize,
    collectedAt: derived.collectedAt,
    positive: derived.positive,
    neutral: derived.neutral,
    negative: derived.negative,
    model: derived.model,
    method: `다국어 감성 분류 모델(${derived.model})이 댓글마다 긍정·중립·부정 중 확률이 가장 높은 라벨을 부여${review ? `. ${review}` : ''}`,
    byVideo: derived.videos,
  }
  await writeJson(fansFile, fansDataSchema.parse({ ...fans, sentiment }))

  const share = (value: number) =>
    `${((value / derived.sampleSize) * 100).toFixed(1)}%`
  console.log(
    `fans.json 감성 분포 반영: ${derived.sampleSize}개 (긍정 ${share(derived.positive)}, 중립 ${share(derived.neutral)}, 부정 ${share(derived.negative)}), 영상 ${derived.videos.length}개`
  )
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
