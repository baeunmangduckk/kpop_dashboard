import { z } from 'zod'
import {
  confidenceSchema,
  idSchema,
  isoDateSchema,
  sourceIdsSchema,
} from './common'

export const metricSchema = z.object({
  id: idSchema,
  label: z.string().min(1),
  // 결측은 0이 아닌 null로 표기해 화면에서 '결측'으로 구분한다
  value: z.number().nullable(),
  unit: z.string(),
  // 전기 대비 증감, 비교 기준이 없으면 null
  delta: z.number().nullable(),
  confidence: confidenceSchema,
  sourceIds: sourceIdsSchema,
  asOf: isoDateSchema.optional(),
  // estimated 지표의 산출 방식 (배지 툴팁 표시용)
  method: z.string().optional(),
  note: z.string().optional(),
})

export const metricsSchema = z.array(metricSchema)

export type Metric = z.infer<typeof metricSchema>
