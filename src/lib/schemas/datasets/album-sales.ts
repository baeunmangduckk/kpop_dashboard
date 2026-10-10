import { sourcedSchema } from '../common'
import { albumSalesListSchema } from '../album-sales'

// 연간 앨범 판매 Top100 원자료 (판매 집중도 집계의 근거)
export const albumSalesDataSchema = sourcedSchema.extend({
  items: albumSalesListSchema.min(1),
})
