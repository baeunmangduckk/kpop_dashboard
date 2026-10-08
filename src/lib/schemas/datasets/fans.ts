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

export const fansDataSchema = z.object({
  video: sourcedSchema.extend({
    title: z.string().min(1),
    views: z.number().int().nonnegative(),
    likes: z.number().int().nonnegative(),
    comments: z.number().int().nonnegative(),
    collectedAt: isoDateSchema,
  }),
  // 감성 분포는 표본 수·수집일을 항상 함께 표기
  sentiment: sourcedSchema.extend({
    sampleSize: z.number().int().positive(),
    collectedAt: isoDateSchema,
    positive: z.number().int().nonnegative(),
    neutral: z.number().int().nonnegative(),
    negative: z.number().int().nonnegative(),
  }),
  channels: sourcedSchema.extend({
    snapshots: z.array(channelSnapshotSchema).min(1),
  }),
  rankings: z.array(rankingSchema),
})

export type Ranking = z.infer<typeof rankingSchema>
export type FansData = z.infer<typeof fansDataSchema>
