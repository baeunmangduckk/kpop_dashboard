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
  // 차트 위에 두는 조작부·범례 (스크린리더에도 노출)
  controls?: ReactNode
  confidence: Confidence
  method?: string
  sources: Source[]
  asOf?: string
  // 같은 데이터의 표 보기 (색에만 의존하지 않는 대체 수단 + 스크린리더 대체 텍스트)
  table: ChartTable
  // 차트가 없으면(표가 알맞은 데이터) 표를 접지 않고 바로 표시
  children?: ReactNode
  className?: string
}

// 모든 차트의 공통 외곽: 제목 → 안내 배지 → 차트 → 표 보기 → 신뢰도·출처
export function ChartFrame({
  title,
  description,
  notices,
  controls,
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
        // min-w-0: 그리드 안에서 넓은 표가 열 폭을 늘리지 않도록 (표는 자체 가로 스크롤)
        'bg-card min-w-0 space-y-3 rounded-xl border p-4 sm:p-5',
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
      {controls}
      {children ? (
        <>
          <div aria-hidden>{children}</div>
          <details className="text-sm">
            <summary className="text-muted-foreground hover:text-foreground w-fit cursor-pointer text-xs">
              표로 보기
            </summary>
            <DataTable title={title} table={table} className="mt-2" />
          </details>
        </>
      ) : (
        <DataTable title={title} table={table} />
      )}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t pt-3">
        <ConfidenceBadge confidence={confidence} method={method} />
        <SourceCitation sources={sources} asOf={asOf} />
      </div>
    </figure>
  )
}

function DataTable({
  title,
  table,
  className,
}: {
  title: string
  table: ChartTable
  className?: string
}) {
  return (
    // 좁은 화면에서 가로로 넘치면 키보드로도 스크롤할 수 있게 초점을 받음
    <div
      tabIndex={0}
      role="region"
      aria-label={`${title} 표`}
      className={cn('overflow-x-auto', className)}
    >
      {/* <caption>은 dev 하이드레이션 불일치를 일으켜(2026-10-09 확인) aria-label로 표 이름 제공 */}
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
                <td key={cellIndex} className="px-2 py-1.5 whitespace-nowrap">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
