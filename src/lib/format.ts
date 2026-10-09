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
  // 기호 단위는 붙여 쓰고, 그 외(억원·장·위 등)는 띄어 쓴다
  return unit === '%' || unit === '%p' ? `${text}${unit}` : `${text} ${unit}`
}

// 결측(null)은 0과 구분해 '결측'으로 표시
export function formatMetricValue(value: number | null, unit: string): string {
  if (value === null) return MISSING_LABEL
  return withUnit(numberFormat.format(value), unit)
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
    text: withUnit(`${sign}${numberFormat.format(delta)}`, unit),
    direction,
  }
}
