import { z } from 'zod'
import { idSchema, sourcedSchema, yearValueSchema } from '../common'

// 조사기관별 K팝 공연 시장 기준값 → 전망값
export const eventForecastSchema = z.object({
  institution: z.string().min(1),
  baseYear: z.number().int(),
  baseValue: z.number(),
  targetYear: z.number().int(),
  targetValue: z.number(),
  cagr: z.number(),
  sourceId: idSchema,
})

export const marketDataSchema = z.object({
  metricIds: z.array(idSchema),
  albumExports: sourcedSchema.extend({
    unit: z.string(),
    points: z.array(yearValueSchema).min(1),
  }),
  eventForecasts: sourcedSchema.extend({
    unit: z.string(),
    rows: z.array(eventForecastSchema).min(1),
  }),
})

export type EventForecast = z.infer<typeof eventForecastSchema>
export type MarketData = z.infer<typeof marketDataSchema>
