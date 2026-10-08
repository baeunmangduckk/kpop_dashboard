import { z } from 'zod'
import { isoDateSchema } from './common'

// 연간 앨범 판매 순위 (Circle Chart 기준)
export const albumSalesSchema = z.object({
  year: z.number().int(),
  rank: z.number().int().min(1),
  album: z.string().min(1),
  artist: z.string().optional(),
  sales: z.number().int().nonnegative(),
  collectedAt: isoDateSchema,
})

export const albumSalesListSchema = z.array(albumSalesSchema)

export type AlbumSales = z.infer<typeof albumSalesSchema>
