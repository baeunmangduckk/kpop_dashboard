import { TONE_META, type Tone } from '@/lib/tone'
import { cn } from '@/lib/utils'

interface ToneLabelProps {
  tone: Tone
  className?: string
}

// 주의·참고·긍정 표시 (아이콘+텍스트, 색에만 의존하지 않음)
export function ToneLabel({ tone, className }: ToneLabelProps) {
  const { label, icon: Icon } = TONE_META[tone]
  return (
    <span
      data-tone={tone}
      className={cn(
        'text-muted-foreground inline-flex shrink-0 items-center gap-1 text-xs font-medium',
        tone === 'warning' && 'text-foreground',
        className
      )}
    >
      <Icon className="size-3.5" aria-hidden />
      {label}
    </span>
  )
}
