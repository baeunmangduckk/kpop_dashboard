import { z } from 'zod'
import { idSchema } from './common'

// 출처 레지스트리 항목
export const sourceSchema = z.object({
  id: idSchema,
  publisher: z.string().min(1),
  title: z.string().min(1),
  year: z.number().int(),
  url: z.url().optional(),
  // 이 출처를 사용하는 페이지 경로
  pages: z.array(z.string()),
})

export const sourcesSchema = z.array(sourceSchema)

export type Source = z.infer<typeof sourceSchema>
