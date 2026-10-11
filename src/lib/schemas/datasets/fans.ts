import { z } from 'zod'
import { isoDateSchema, sourcedSchema } from '../common'
import { channelSnapshotSchema } from '../channel'

const artistValueSchema = z.object({
  artist: z.string().min(1),
  value: z.number().nonnegative(),
})

export const rankingSchema = sourcedSchema.extend({
  id: z.string().min(1),
  title: z.string().min(1),
  unit: z.string(),
  rows: z.array(artistValueSchema).min(1),
})

// 영상 반응 표본 - reference: 기준 영상(댓글 감성 표본), mv: 채널별 최신 뮤직비디오
export const videoStatSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  artist: z.string().min(1).nullable(),
  kind: z.enum(['reference', 'mv']),
  publishedAt: isoDateSchema,
  views: z.number().int().nonnegative(),
  // 좋아요 비공개·댓글 차단 영상은 null
  likes: z.number().int().nonnegative().nullable(),
  comments: z.number().int().nonnegative().nullable(),
})

const sentimentCountSchema = z.object({
  videoId: z.string().min(1),
  sampleSize: z.number().int().positive(),
  positive: z.number().int().nonnegative(),
  neutral: z.number().int().nonnegative(),
  negative: z.number().int().nonnegative(),
})

// 댓글에 많이 나온 단어 - count는 그 단어가 들어간 댓글 수, lean은 워드 클라우드 색
export const sentimentWordSchema = z.object({
  word: z.string().min(1),
  count: z.number().int().positive(),
  positive: z.number().int().nonnegative(),
  neutral: z.number().int().nonnegative(),
  negative: z.number().int().nonnegative(),
  lean: z.enum(['positive', 'neutral', 'negative']),
})

export const fansDataSchema = z.object({
  videos: sourcedSchema.extend({
    collectedAt: isoDateSchema,
    items: z.array(videoStatSchema).min(1),
  }),
  // 감성 분포는 표본 수·수집일을 항상 함께 표기
  sentiment: sourcedSchema.extend({
    sampleSize: z.number().int().positive(),
    collectedAt: isoDateSchema,
    positive: z.number().int().nonnegative(),
    neutral: z.number().int().nonnegative(),
    negative: z.number().int().nonnegative(),
    // 분류 모델과 산출 방식 (검수 일치율 포함)
    model: z.string().min(1),
    method: z.string().min(1),
    // 영상별 분포 - videoId는 videos.items의 id
    byVideo: z.array(sentimentCountSchema).min(1),
    // 범위별 단어 (전체 / 뮤직비디오 / 기준 영상), 댓글 본문은 싣지 않음
    words: z.object({
      all: z.array(sentimentWordSchema).min(1),
      mv: z.array(sentimentWordSchema).min(1),
      reference: z.array(sentimentWordSchema).min(1),
    }),
  }),
  channels: sourcedSchema.extend({
    snapshots: z.array(channelSnapshotSchema).min(1),
  }),
  rankings: z.array(rankingSchema),
})

export type VideoStat = z.infer<typeof videoStatSchema>
export type SentimentWord = z.infer<typeof sentimentWordSchema>
export type Ranking = z.infer<typeof rankingSchema>
export type FansData = z.infer<typeof fansDataSchema>
