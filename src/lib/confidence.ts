import { CONFIDENCE_LEVELS } from '@/lib/confidence-levels'
import type { Confidence } from '@/lib/schemas'

interface ConfidenceMeta {
  label: string
  description: string
}

// 신뢰도 라벨 표시명과 정의 - 배지 Popover와 출처·신뢰도 페이지 설명이 함께 사용
export const CONFIDENCE_META: Record<Confidence, ConfidenceMeta> = {
  verified: {
    label: '검증됨',
    description:
      '공시·API·발표처 원문 등 1차 자료와 직접 대조를 마친 값입니다. (예: OpenDART 공시, YouTube Data API 실측, Circle Chart 원자료 집계)',
  },
  estimated: {
    label: '추정',
    description:
      '원자료를 계산·추정한 값이거나, 원 발표를 인용한 보도로만 확인한 값·리서치 기관 전망치입니다. 산출 방식과 메모를 함께 확인하세요.',
  },
  unverified: {
    label: '미검증',
    description:
      '보고서의 값을 옮겼지만 원문에서 다시 확인하지 못한 값입니다. 의사결정에 쓰기 전 원문 확인을 권장합니다.',
  },
}

// 라벨별 개수 (지표 묶음의 신뢰도 구성 표기용)
export function countByConfidence(
  items: { confidence: Confidence }[]
): Record<Confidence, number> {
  const counts = Object.fromEntries(
    CONFIDENCE_LEVELS.map(level => [level, 0])
  ) as Record<Confidence, number>
  for (const item of items) counts[item.confidence] += 1
  return counts
}
