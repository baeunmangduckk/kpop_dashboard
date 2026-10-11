const MISSING_LABEL = '결측'

export type DeltaDirection = 'up' | 'down' | 'flat'

export interface FormattedDelta {
  text: string
  direction: DeltaDirection
}

// 소수 자릿수는 원자료 정밀도를 유지하되 최대 4자리까지만 표시
const numberFormat = new Intl.NumberFormat('ko-KR', {
  maximumFractionDigits: 4,
})

function withUnit(text: string, unit: string): string {
  if (!unit) return text
  // 한글 단위·기호는 붙여 쓰고(317억 달러, 29배, 1.86%), 영문 단위만 띄어 쓴다
  return /^[A-Za-z]/.test(unit) ? `${text} ${unit}` : `${text}${unit}`
}

const EOK_PER_JO = 10000

// 억원 단위 값이 1조 이상이면 조·억으로 풀어 쓴다 (51,920.6 → 5조 1,921억원, 억 미만 반올림)
function formatEokWon(value: number): string | null {
  const rounded = Math.round(Math.abs(value))
  if (rounded < EOK_PER_JO) return null
  const jo = Math.floor(rounded / EOK_PER_JO)
  const eok = rounded % EOK_PER_JO
  const sign = value < 0 ? '-' : ''
  return eok === 0
    ? `${sign}${numberFormat.format(jo)}조원`
    : `${sign}${numberFormat.format(jo)}조 ${numberFormat.format(eok)}억원`
}

function formatWithUnit(value: number, unit: string): string {
  const large = unit === '억원' ? formatEokWon(value) : null
  return large ?? withUnit(numberFormat.format(value), unit)
}

// 결측(null)은 0과 구분해 '결측'으로 표시
export function formatMetricValue(value: number | null, unit: string): string {
  if (value === null) return MISSING_LABEL
  return formatWithUnit(value, unit)
}

// 차트 축 눈금용 축약 표기 (360px 화면에서 겹치지 않도록 억·만 단위로 줄임)
const compactFormat = new Intl.NumberFormat('ko-KR', {
  maximumFractionDigits: 1,
})

export function formatCompact(value: number): string {
  const abs = Math.abs(value)
  if (abs >= 1e8) return `${compactFormat.format(value / 1e8)}억`
  if (abs >= 1e4) return `${compactFormat.format(value / 1e4)}만`
  return compactFormat.format(value)
}

// 값 축 눈금 - 억원 단위는 '6만' 대신 '6조'로 읽히게 한다
export function formatAxisTick(value: number, unit: string): string {
  if (unit === '억원' && Math.abs(value) >= EOK_PER_JO) {
    return `${compactFormat.format(value / EOK_PER_JO)}조`
  }
  // 천만 단위 눈금(7,500만)은 축 폭을 넘어 잘리므로 '7.5천만'으로 줄인다
  const abs = Math.abs(value)
  if (abs >= 1e7 && abs < 1e8) {
    return `${compactFormat.format(value / 1e7)}천만`
  }
  return formatCompact(value)
}

export function formatDelta(
  delta: number | null,
  unit: string
): FormattedDelta | null {
  if (delta === null) return null
  const direction: DeltaDirection =
    delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat'
  const sign = delta > 0 ? '+' : ''
  return {
    text: `${sign}${formatWithUnit(delta, unit)}`,
    direction,
  }
}
