// 신뢰도 라벨 (F010): 모든 지표는 셋 중 하나를 반드시 가진다
// zod를 끌어오지 않도록 분리 - 클라이언트 컴포넌트는 이 파일에서 직접 가져온다
export const CONFIDENCE_LEVELS = [
  'verified',
  'estimated',
  'unverified',
] as const

export type ConfidenceLevel = (typeof CONFIDENCE_LEVELS)[number]
