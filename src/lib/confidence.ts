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
      '공시·API 등 원자료와 직접 대조를 마친 값입니다. (예: OpenDART 공시, YouTube Data API 실측)',
  },
  estimated: {
    label: '추정',
    description:
      '원자료를 바탕으로 단위 보정·계산·추정을 거친 값입니다. 산출 방식을 함께 확인하세요.',
  },
  unverified: {
    label: '미검증',
    description:
      '보도·리서치 기관 자료를 옮겼지만 원문 재확인을 마치지 않은 값입니다. 의사결정에 쓰기 전 원문 확인을 권장합니다.',
  },
}
