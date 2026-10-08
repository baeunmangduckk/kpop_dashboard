import { z } from 'zod'
import { confidenceSchema, sourceIdsSchema } from './common'

// 기획사 연도별 재무 (단위: 억원)
export const companyFinancialSchema = z.object({
  company: z.string().min(1),
  year: z.number().int(),
  // 미공시 연도는 null
  revenue: z.number().nullable(),
  operatingProfit: z.number().nullable(),
  confidence: confidenceSchema,
  sourceIds: sourceIdsSchema,
})

export const companyFinancialsSchema = z.array(companyFinancialSchema)

export type CompanyFinancial = z.infer<typeof companyFinancialSchema>
