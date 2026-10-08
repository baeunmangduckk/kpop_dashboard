import { z } from 'zod'
import { idSchema, sourcedSchema } from '../common'
import { companyFinancialSchema } from '../finance'

// major: 상장 4사, mid: 중소 상장사
export const companySchema = z.object({
  name: z.string().min(1),
  tier: z.enum(['major', 'mid']),
})

const companyRevenueSchema = z.object({
  company: z.string().min(1),
  revenue: z.number(),
})

export const financeDataSchema = z.object({
  metricIds: z.array(idSchema),
  companies: z.array(companySchema).min(1),
  financials: z.array(companyFinancialSchema).min(1),
  // 분기 매출 비교 (대형 vs 중소 격차)
  quarterlyRevenue: sourcedSchema.extend({
    period: z.string().min(1),
    unit: z.string(),
    rows: z.array(companyRevenueSchema).min(1),
  }),
})

export type Company = z.infer<typeof companySchema>
export type FinanceData = z.infer<typeof financeDataSchema>
