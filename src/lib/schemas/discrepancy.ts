import { z } from 'zod'
import { idSchema } from './common'

// 출처별로 다른 값: 어떤 값을 어느 출처에서 가져왔는지 함께 보관
export const discrepancyValueSchema = z.object({
  value: z.number(),
  sourceId: idSchema,
})

export const discrepancySchema = z.object({
  metricId: idSchema,
  adopted: discrepancyValueSchema,
  alternative: discrepancyValueSchema,
  note: z.string().min(1),
})

export const discrepanciesSchema = z.array(discrepancySchema)

export type DiscrepancyValue = z.infer<typeof discrepancyValueSchema>
export type Discrepancy = z.infer<typeof discrepancySchema>
