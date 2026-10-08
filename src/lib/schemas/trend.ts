import { z } from 'zod'
import { isoDateSchema } from './common'

// Google Trends 시계열 한 점, 관심도는 기간 내 최댓값 100 기준 상대지수
export const trendPointSchema = z.object({
  keyword: z.string().min(1),
  region: z.string().min(1),
  date: isoDateSchema,
  interest: z.number().min(0).max(100),
})

export const trendSeriesSchema = z.array(trendPointSchema)

export type TrendPoint = z.infer<typeof trendPointSchema>
export type TrendSeries = z.infer<typeof trendSeriesSchema>
