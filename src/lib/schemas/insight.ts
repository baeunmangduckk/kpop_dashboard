import { z } from 'zod'
import { idSchema } from './common'

export const insightSchema = z.object({
  id: idSchema,
  // auto: 규칙 기반 자동 생성, manual: 보고서 큐레이션
  kind: z.enum(['auto', 'manual']),
  tone: z.enum(['warning', 'info', 'positive']),
  text: z.string().min(1),
  metricIds: z.array(idSchema),
})

export const insightsSchema = z.array(insightSchema)

export type Insight = z.infer<typeof insightSchema>
