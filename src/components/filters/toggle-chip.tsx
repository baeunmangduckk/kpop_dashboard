'use client'

import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'

// 필터 한 줄 (라벨 + 칩 목록)
export function FilterGroup({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-muted-foreground min-w-8 shrink-0 text-xs font-medium">
        {label}
      </span>
      {children}
    </div>
  )
}

// 켜고 끄는 필터 칩 (aria-pressed로 상태 노출)
export function ToggleChip({
  label,
  pressed,
  onClick,
}: {
  label: string
  pressed: boolean
  onClick: () => void
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant={pressed ? 'secondary' : 'outline'}
      aria-pressed={pressed}
      onClick={onClick}
      className={pressed ? 'border-ring/40 border' : 'text-muted-foreground'}
    >
      {label}
    </Button>
  )
}
