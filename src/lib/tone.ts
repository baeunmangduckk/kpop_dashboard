import { CircleAlert, Info, TrendingUp, type LucideIcon } from 'lucide-react'
import type { Insight } from '@/lib/schemas'

export type Tone = Insight['tone']

interface ToneMeta {
  label: string
  icon: LucideIcon
}

// 인사이트·지속가능성 신호의 성격 표시 - 색이 아니라 아이콘+라벨로 구분
export const TONE_META: Record<Tone, ToneMeta> = {
  warning: { label: '주의', icon: CircleAlert },
  info: { label: '참고', icon: Info },
  positive: { label: '긍정', icon: TrendingUp },
}
