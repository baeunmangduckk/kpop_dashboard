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
  }),
  channels: sourcedSchema.extend({
    snapshots: z.array(channelSnapshotSchema).min(1),
  }),
  rankings: z.array(rankingSchema),
})

export type VideoStat = z.infer<typeof videoStatSchema>
export type Ranking = z.infer<typeof rankingSchema>
export type FansData = z.infer<typeof fansDataSchema>
