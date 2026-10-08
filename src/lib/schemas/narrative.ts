import { z } from 'zod'
import { idSchema } from './common'

// 3대 서사: ① 둔화 ② 분산·집중 ③ 지역 재편과 AI·버추얼
export const NARRATIVE_SLUGS = [
  'slowdown',
  'polarization',
  'realignment',
] as const
export const narrativeSlugSchema = z.enum(NARRATIVE_SLUGS)

// 문단 하나와 그 문단의 근거 지표 묶음
export const narrativeSectionSchema = z.object({
  heading: z.string().optional(),
  body: z.string().min(1),
  metricIds: z.array(idSchema),
})

export const narrativeSchema = z.object({
  id: narrativeSlugSchema,
  title: z.string().min(1),
  message: z.string().min(1),
  sections: z.array(narrativeSectionSchema).min(1),
})

export const narrativesSchema = z.array(narrativeSchema)

export type NarrativeSlug = z.infer<typeof narrativeSlugSchema>
export type NarrativeSection = z.infer<typeof narrativeSectionSchema>
export type Narrative = z.infer<typeof narrativeSchema>
