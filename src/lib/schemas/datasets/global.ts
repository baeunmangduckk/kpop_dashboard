import { z } from 'zod'
import { idSchema, sourcedSchema } from '../common'

const regionChangeSchema = z.object({
  region: z.string().min(1),
  from: z.number(),
  to: z.number(),
})

export const globalDataSchema = z.object({
  metricIds: z.array(idSchema),
  // 방송콘텐츠 수출을 음악 수출의 프록시로 사용 (안내 배지 표시)
  regionExports: sourcedSchema.extend({
    isProxy: z.boolean(),
    unit: z.string(),
    fromYear: z.number().int(),
    toYear: z.number().int(),
    rows: z.array(regionChangeSchema).min(1),
  }),
  promisingRegions: sourcedSchema.extend({
    regions: z.array(z.string().min(1)).min(1),
    description: z.string().min(1),
  }),
})

export type GlobalData = z.infer<typeof globalDataSchema>
