import { cn } from '@/lib/utils'

interface EmptyStateProps {
  message: string
  className?: string
}

// 데이터가 비었을 때의 안내 (빈 카드·빈 목록 대신 표시)
export function EmptyState({ message, className }: EmptyStateProps) {
  return (
    <p
      className={cn(
        'text-muted-foreground rounded-xl border border-dashed p-6 text-center text-sm',
        className
      )}
    >
      {message}
    </p>
  )
}
