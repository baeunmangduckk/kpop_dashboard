// 연간 Top100 판매량에서 집중도 지표를 계산하는 순수 함수 모음

const round = (value: number, digits: number) => Number(value.toFixed(digits))

export interface YearConcentration {
  year: number
  count: number
  total: number
  first: number
  last: number
  // 점유율 (%)
  top10: number
  top20: number
  bottom50: number
  gini: number
}

// Gini 계수 (0: 완전 균등, 1: 완전 집중) - 오름차순 누적 가중 방식
export function gini(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b)
  const n = sorted.length
  const total = sorted.reduce((sum, value) => sum + value, 0)
  if (n === 0 || total === 0) return 0
  const weighted = sorted.reduce(
    (sum, value, index) => sum + (index + 1) * value,
    0
  )
  return (2 * weighted) / (n * total) - (n + 1) / n
}

// sales: 해당 연도 순위표의 판매량 (순위 무관, 내부에서 내림차순 정렬)
export function summarizeYear(
  year: number,
  sales: number[]
): YearConcentration {
  const sorted = [...sales].sort((a, b) => b - a)
  const total = sorted.reduce((sum, value) => sum + value, 0)
  const share = (slice: number[]) =>
    round((slice.reduce((sum, value) => sum + value, 0) / total) * 100, 2)

  return {
    year,
    count: sorted.length,
    total,
    first: sorted[0],
    last: sorted[sorted.length - 1],
    top10: share(sorted.slice(0, 10)),
    top20: share(sorted.slice(0, 20)),
    bottom50: share(sorted.slice(50)),
    gini: round(gini(sorted), 4),
  }
}
