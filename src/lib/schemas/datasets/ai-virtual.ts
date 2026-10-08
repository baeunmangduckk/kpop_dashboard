import { z } from 'zod'
import {
  idSchema,
  isoDateSchema,
  sourceIdsSchema,
  sourcedSchema,
  yearValueSchema,
} from '../common'

export const virtualCaseSchema = z.object({
  name: z.string().min(1),
  kind: z.enum(['virtual', 'ai']),
  agency: z.string().min(1),
  debutDate: isoDateSchema,
  summary: z.string().min(1),
  sourceIds: sourceIdsSchema,
})

export const aiVirtualDataSchema = z.object({
  metricIds: z.array(idSchema),
  platformMetricIds: z.array(idSchema),
  // CAGR 복리로 계산한 추정 경로
  marketPath: sourcedSchema.extend({
    unit: z.string(),
    cagr: z.number(),
    points: z.array(yearValueSchema).min(1),
  }),
  cases: z.array(virtualCaseSchema),
})

export type VirtualCase = z.infer<typeof virtualCaseSchema>
export type AiVirtualData = z.infer<typeof aiVirtualDataSchema>
