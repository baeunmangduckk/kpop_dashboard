import { z } from 'zod'
import { isoDateSchema } from './common'

// YouTube 채널 스냅샷 (수집 시점별 누적)
export const channelSnapshotSchema = z.object({
  artist: z.string().min(1),
  subscribers: z.number().int().nonnegative(),
  // 구독자 순위만 공개된 경우 조회수는 null
  views: z.number().int().nonnegative().nullable(),
  capturedAt: isoDateSchema,
})

export const channelSnapshotsSchema = z.array(channelSnapshotSchema)

export type ChannelSnapshot = z.infer<typeof channelSnapshotSchema>
