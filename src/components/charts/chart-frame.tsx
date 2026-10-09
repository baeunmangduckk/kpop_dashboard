import type { ReactNode } from 'react'
import { ConfidenceBadge, SourceCitation } from '@/components/confidence'
import type { Confidence, Source } from '@/lib/schemas'
import { cn } from '@/lib/utils'

export interface ChartTable {
  columns: string[]
  rows: (string | number)[][]
}

interface ChartFrameProps {
  title: string
  description?: string
  // NoticeBadge 등 해석 주의 안내
  notices?: ReactNode
  confidence: Confidence
  method?: string
  sources: Source[]
  asOf?: string
  // 같은 데이터의 표 보기 (색에만 의존하지 않는 대체 수단 + 스크린리더 대체 텍스트)
  table: ChartTable
  children: ReactNode
  className?: string
}

// 모든 차트의 공통 외곽: 제목 → 안내 배지 → 차트 → 표 보기 → 신뢰도·출처
export function ChartFrame({
  title,
  description,
  notices,
  confidence,
  method,
  sources,
  asOf,
  table,
  children,
  className,
}: ChartFrameProps) {
  return (
    <figure
      className={cn(
        'bg-card space-y-3 rounded-xl border p-4 sm:p-5',
        className
      )}
    >
      <figcaption className="space-y-1">
        <p className="font-semibold">{title}</p>
        {description && (
          <p className="text-muted-foreground text-sm">{description}</p>
        )}
      </figcaption>
      {notices && <div className="flex flex-wrap gap-2">{notices}</div>}
      <div aria-hidden>{children}</div>
      <details className="group text-sm">
        <summary className="text-muted-foreground hover:text-foreground w-fit cursor-pointer text-xs">
          표로 보기
        </summary>
        <div className="mt-2 overflow-x-auto">
          <table
            aria-label={title}
            className="w-full text-left text-xs tabular-nums"
          >
            <thead>
              <tr className="border-b">
                {table.columns.map(column => (
                  <th
                    key={column}
                    scope="col"
                    className="px-2 py-1.5 font-medium whitespace-nowrap"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b last:border-0">
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="px-2 py-1.5 whitespace-nowrap"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t pt-3">
        <ConfidenceBadge confidence={confidence} method={method} />
        <SourceCitation sources={sources} asOf={asOf} />
      </div>
    </figure>
  )
}
