import { z } from 'zod'
import { CONFIDENCE_LEVELS } from '../confidence-levels'

export { CONFIDENCE_LEVELS }
export const confidenceSchema = z.enum(CONFIDENCE_LEVELS)

export const idSchema = z.string().trim().min(1)

// 기준일·수집일은 'YYYY-MM-DD' 문자열로 저장
export const isoDateSchema = z.iso.date()

// 출처 연결 (F011): 출처 없는 수치는 허용하지 않는다
export const sourceIdsSchema = z.array(idSchema).min(1)

// 차트·표 단위 데이터 묶음에 붙는 신뢰도·출처 (F010·F011)
export const sourcedSchema = z.object({
  confidence: confidenceSchema,
  sourceIds: sourceIdsSchema,
  asOf: isoDateSchema.optional(),
  note: z.string().optional(),
})

// 연도별 값, 원자료에 없는 연도는 null (차트에서 끊김 표시)
export const yearValueSchema = z.object({
  year: z.number().int(),
  value: z.number().nullable(),
})

export type Confidence = z.infer<typeof confidenceSchema>
export type Sourced = z.infer<typeof sourcedSchema>
export type YearValue = z.infer<typeof yearValueSchema>
