import { z } from 'zod'
import { narrativeSectionSchema, narrativeSlugSchema } from './narrative'

// 종합 결론: 서사별 정리(근거 지표 연결) + 함께 읽은 종합 + 이 데이터로 말할 수 없는 것
export const conclusionPointSchema = narrativeSectionSchema.extend({
  narrative: narrativeSlugSchema,
  heading: z.string().min(1),
})

export const conclusionSchema = z.object({
  title: z.string().min(1),
  message: z.string().min(1),
  points: z.array(conclusionPointSchema).min(1),
  synthesis: z.array(z.string().min(1)).min(1),
  caveats: z.array(z.string().min(1)).min(1),
})

export type ConclusionPoint = z.infer<typeof conclusionPointSchema>
export type Conclusion = z.infer<typeof conclusionSchema>
