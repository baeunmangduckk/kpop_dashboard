import { z } from 'zod'
import { idSchema } from '../common'
import { metricSchema } from '../metric'

// metrics.json: 전체 지표 레지스트리 + 홈 KPI 노출 순서
export const metricRegistrySchema = z.object({
  homeKpiIds: z.array(idSchema).length(6),
  items: z.array(metricSchema).min(1),
})

export type MetricRegistry = z.infer<typeof metricRegistrySchema>
