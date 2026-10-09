'use client'

import Link from 'next/link'
import { BadgeCheck, CircleHelp, Calculator } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { CONFIDENCE_META } from '@/lib/confidence'
import type { Confidence } from '@/lib/schemas'
import { sourcesLink } from '@/lib/navigation'
import { cn } from '@/lib/utils'

const STYLE: Record<Confidence, string> = {
  verified:
    'bg-verified text-verified-foreground border-verified-foreground/30',
  estimated:
    'bg-estimated text-estimated-foreground border-estimated-foreground/30',
  unverified:
    'bg-unverified text-unverified-foreground border-unverified-foreground/30',
}

const ICON = {
  verified: BadgeCheck,
  estimated: Calculator,
  unverified: CircleHelp,
} satisfies Record<Confidence, typeof BadgeCheck>

interface ConfidenceBadgeProps {
  confidence: Confidence
  // estimated 지표의 산출 방식
  method?: string
  className?: string
}

// 신뢰도 배지 (F010) - 클릭·탭으로 라벨 정의와 산출 방식을 확인 (터치 기기 대응을 위해 hover 툴팁 대신 Popover)
export function ConfidenceBadge({
  confidence,
  method,
  className,
}: ConfidenceBadgeProps) {
  const meta = CONFIDENCE_META[confidence]
  const Icon = ICON[confidence]

  return (
    <Popover>
      <PopoverTrigger
        data-confidence={confidence}
        aria-label={`신뢰도: ${meta.label} (설명 보기)`}
        className={cn(
          'focus-visible:ring-ring/50 inline-flex w-fit shrink-0 items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-shadow outline-none focus-visible:ring-[3px]',
          STYLE[confidence],
          className
        )}
      >
        <Icon className="size-3" aria-hidden />
        {meta.label}
      </PopoverTrigger>
      <PopoverContent className="w-72 space-y-2 text-sm" align="start">
        <p className="font-semibold">신뢰도: {meta.label}</p>
        <p className="text-muted-foreground">{meta.description}</p>
        {method && (
          <p>
            <span className="font-medium">산출 방식 </span>
            {method}
          </p>
        )}
        <Link
          href={sourcesLink.href}
          className="text-primary inline-block text-xs underline-offset-4 hover:underline"
        >
          출처·신뢰도 기준 보기
        </Link>
      </PopoverContent>
    </Popover>
  )
}
