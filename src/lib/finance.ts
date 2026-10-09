import type { CompanyFinancial } from '@/lib/schemas'

// 영업이익률(%) - 매출이나 영업이익이 결측이면 결측
export function operatingMargin(row: CompanyFinancial): number | null {
  if (row.revenue === null || row.operatingProfit === null || row.revenue === 0)
    return null
  return Math.round((row.operatingProfit / row.revenue) * 1000) / 10
}

// 전년 대비 증감 표기 - 적자 전환·흑자 전환·적자 지속은 증감률 대신 상태로 표시
export function describeChange(
  current: number | null,
  previous: number | null
): string {
  if (current === null || previous === null) return '비교불가'
  if (previous < 0 && current >= 0) return '흑자 전환'
  if (previous >= 0 && current < 0) return '적자 전환'
  if (previous < 0 && current < 0) return '적자 지속'
  if (previous === 0) return '비교불가'
  const rate = ((current - previous) / previous) * 100
  return `${rate >= 0 ? '+' : ''}${rate.toFixed(1)}%`
}
