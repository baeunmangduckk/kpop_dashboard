import { z } from 'zod'
import { idSchema, sourcedSchema } from '../common'

const regionChangeSchema = z.object({
  region: z.string().min(1),
  from: z.number(),
  to: z.number(),
})

const countryInterestSchema = z.object({
  country: z.string().min(1),
  interest: z.number().min(0).max(100),
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
  // Task 014에서 Google Trends 실데이터로 교체 전까지 isDummy: true
  countryInterest: sourcedSchema.extend({
    keyword: z.string().min(1),
    isDummy: z.boolean(),
    rows: z.array(countryInterestSchema).min(1),
  }),
})

export type GlobalData = z.infer<typeof globalDataSchema>
