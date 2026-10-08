import { z } from 'zod'
import { sourcedSchema } from '../common'
import { trendPointSchema } from '../trend'

const risingQuerySchema = z.object({
  keyword: z.string().min(1),
  query: z.string().min(1),
  // 상승률(%), Google Trends에서 '급상승'으로만 표기되면 null
  growth: z.number().nullable(),
})

export const trendsDataSchema = sourcedSchema.extend({
  // Task 014에서 실제 Google Trends CSV로 교체 전까지 true
  isDummy: z.boolean(),
  keywords: z.array(z.string().min(1)).min(1),
  // 상대지수 비교 기준 키워드
  baselineKeyword: z.string().min(1),
  series: z.array(trendPointSchema).min(1),
  risingQueries: z.array(risingQuerySchema),
})

export type TrendsData = z.infer<typeof trendsDataSchema>
