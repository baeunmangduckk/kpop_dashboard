import { z } from 'zod'
import { idSchema, sourcedSchema } from '../common'

const shareTrendPointSchema = z.object({
  year: z.number().int(),
  top10: z.number().nullable(),
  top20: z.number().nullable(),
  bottom50: z.number().nullable(),
})

const giniPointSchema = z.object({
  year: z.number().int(),
  gini: z.number().min(0).max(1),
})

const topVsBottomPointSchema = z.object({
  year: z.number().int(),
  first: z.number().int().nonnegative(),
  hundredth: z.number().int().nonnegative(),
})

const totalSalesPointSchema = z.object({
  year: z.number().int(),
  total: z.number().int().nonnegative(),
})

// 대기업 vs 중소기업 비교 항목
const capitalGapRowSchema = z.object({
  label: z.string().min(1),
  unit: z.string(),
  large: z.number(),
  small: z.number(),
})

const labeledValueSchema = z.object({
  label: z.string().min(1),
  value: z.number(),
  unit: z.string(),
})

// 지속가능성 리스크·기회 신호
export const signalSchema = sourcedSchema.extend({
  tone: z.enum(['warning', 'info', 'positive']),
  title: z.string().min(1),
  detail: z.string().min(1),
})

export const concentrationDataSchema = z.object({
  metricIds: z.array(idSchema),
  shareTrend: sourcedSchema.extend({
    points: z.array(shareTrendPointSchema).min(1),
  }),
  giniTrend: sourcedSchema.extend({
    points: z.array(giniPointSchema).min(1),
  }),
  topVsBottom: sourcedSchema.extend({
    points: z.array(topVsBottomPointSchema).min(1),
  }),
  totalSales: sourcedSchema.extend({
    points: z.array(totalSalesPointSchema).min(1),
  }),
  capitalGap: sourcedSchema.extend({
    baseYear: z.number().int(),
    rows: z.array(capitalGapRowSchema).min(1),
  }),
  survival: sourcedSchema.extend({
    sampleSize: z.number().int().positive(),
    rates: z.array(labeledValueSchema).min(1),
    tiers: z.array(labeledValueSchema).min(1),
  }),
  signals: z.array(signalSchema),
})

export type Signal = z.infer<typeof signalSchema>
export type ConcentrationData = z.infer<typeof concentrationDataSchema>
