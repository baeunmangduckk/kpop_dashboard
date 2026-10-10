'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { ConfidenceBadge } from '@/components/confidence'
import { FilterGroup, ToggleChip } from '@/components/filters/toggle-chip'
import { Input } from '@/components/ui/input'
import { CONFIDENCE_META } from '@/lib/confidence'
import { CONFIDENCE_LEVELS, type Confidence } from '@/lib/schemas'

export interface SourceRow {
  id: string
  publisher: string
  title: string
  year: number
  // 원문 링크 (확인된 출처만)
  url?: string
  pages: { href: string; title: string }[]
  confidences: Confidence[]
  metrics: { id: string; label: string; href?: string }[]
}

interface SourcesExplorerProps {
  rows: SourceRow[]
}

const ALL = 'all'

// 출처 레지스트리 표 - 사용 페이지·신뢰도 필터와 검색, 각 행은 /sources#source-{id} 앵커
export function SourcesExplorer({ rows }: SourcesExplorerProps) {
  const [page, setPage] = useState<string>(ALL)
  const [confidence, setConfidence] = useState<Confidence | typeof ALL>(ALL)
  const [query, setQuery] = useState('')

  const pageOptions = [
    ...new Map(
      rows.flatMap(row => row.pages).map(item => [item.href, item])
    ).values(),
  ]
  const keyword = query.trim().toLowerCase()
  const filtered = rows.filter(
    row =>
      (page === ALL || row.pages.some(item => item.href === page)) &&
      (confidence === ALL || row.confidences.includes(confidence)) &&
      (!keyword ||
        `${row.publisher} ${row.title}`.toLowerCase().includes(keyword))
  )

  return (
    <div className="space-y-4">
      <div
        role="group"
        aria-label="출처 필터"
        className="bg-card space-y-3 rounded-xl border p-4"
      >
        <Input
          type="search"
          value={query}
          onChange={event => setQuery(event.target.value)}
          placeholder="발행처·제목 검색"
          aria-label="발행처·제목 검색"
          className="max-w-sm"
        />
        <FilterGroup label="페이지">
          <ToggleChip
            label="전체"
            pressed={page === ALL}
            onClick={() => setPage(ALL)}
          />
          {pageOptions.map(item => (
            <ToggleChip
              key={item.href}
              label={item.title}
              pressed={page === item.href}
              onClick={() => setPage(item.href)}
            />
          ))}
        </FilterGroup>
        <FilterGroup label="신뢰도">
          <ToggleChip
            label="전체"
            pressed={confidence === ALL}
            onClick={() => setConfidence(ALL)}
          />
          {CONFIDENCE_LEVELS.map(level => (
            <ToggleChip
              key={level}
              label={CONFIDENCE_META[level].label}
              pressed={confidence === level}
              onClick={() => setConfidence(level)}
            />
          ))}
        </FilterGroup>
      </div>

      <p className="text-muted-foreground text-sm" aria-live="polite">
        출처 {filtered.length}건 / 전체 {rows.length}건
      </p>

      <div className="bg-card overflow-x-auto rounded-xl border">
        <table
          aria-label="출처 레지스트리"
          className="w-full text-left text-sm max-md:block"
        >
          <thead className="max-md:sr-only">
            <tr className="border-b">
              {[
                '발행처·제목',
                '연도',
                '신뢰도',
                '사용 페이지',
                '사용 지표',
              ].map(column => (
                <th
                  key={column}
                  scope="col"
                  className="px-3 py-2 text-xs font-medium whitespace-nowrap"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="max-md:block">
            {filtered.map(row => (
              <tr
                key={row.id}
                id={`source-${row.id}`}
                className="target:bg-muted data-hash-target:bg-muted scroll-mt-24 border-b align-top last:border-0 max-md:block max-md:py-2"
              >
                <td className="px-3 py-3 max-md:block max-md:pb-1 md:min-w-48">
                  <p className="font-medium">{row.publisher}</p>
                  <p className="text-muted-foreground text-xs">{row.title}</p>
                  {row.url && (
                    <a
                      href={row.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary mt-1 inline-flex items-center gap-1 text-xs underline-offset-4 hover:underline"
                    >
                      원문 보기
                      <ExternalLink className="size-3" aria-hidden />
                      <span className="sr-only">(새 창)</span>
                    </a>
                  )}
                </td>
                <td
                  data-label="연도"
                  className="max-md:before:text-muted-foreground px-3 py-3 tabular-nums max-md:flex max-md:items-start max-md:gap-3 max-md:py-1.5 max-md:before:w-16 max-md:before:shrink-0 max-md:before:pt-0.5 max-md:before:text-[11px] max-md:before:content-[attr(data-label)]"
                >
                  {row.year}
                </td>
                <td
                  data-label="신뢰도"
                  className="max-md:before:text-muted-foreground px-3 py-3 max-md:flex max-md:items-start max-md:gap-3 max-md:py-1.5 max-md:before:w-16 max-md:before:shrink-0 max-md:before:pt-0.5 max-md:before:text-[11px] max-md:before:content-[attr(data-label)]"
                >
                  {row.confidences.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {row.confidences.map(level => (
                        <ConfidenceBadge key={level} confidence={level} />
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-xs">
                      참고용
                    </span>
                  )}
                </td>
                <td
                  data-label="사용 페이지"
                  className="max-md:before:text-muted-foreground px-3 py-3 max-md:flex max-md:items-start max-md:gap-3 max-md:py-1.5 max-md:before:w-16 max-md:before:shrink-0 max-md:before:pt-0.5 max-md:before:text-[11px] max-md:before:content-[attr(data-label)]"
                >
                  <ul className="space-y-1 text-xs">
                    {row.pages.length === 0 && (
                      <li className="text-muted-foreground">—</li>
                    )}
                    {row.pages.map(item => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className="hover:text-foreground text-muted-foreground whitespace-nowrap underline-offset-4 hover:underline"
                        >
                          {item.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </td>
                <td
                  data-label="사용 지표"
                  className="max-md:before:text-muted-foreground px-3 py-3 max-md:flex max-md:items-start max-md:gap-3 max-md:py-1.5 max-md:before:w-16 max-md:before:shrink-0 max-md:before:pt-0.5 max-md:before:text-[11px] max-md:before:content-[attr(data-label)] md:min-w-48"
                >
                  <ul className="space-y-1 text-xs">
                    {row.metrics.length === 0 && (
                      <li className="text-muted-foreground">—</li>
                    )}
                    {row.metrics.map(metric => (
                      <li key={metric.id}>
                        {metric.href ? (
                          <Link
                            href={metric.href}
                            className="text-primary underline-offset-4 hover:underline"
                          >
                            {metric.label}
                          </Link>
                        ) : (
                          metric.label
                        )}
                      </li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr className="max-md:block">
                <td
                  colSpan={5}
                  className="text-muted-foreground px-3 py-8 text-center text-sm max-md:block"
                >
                  조건에 맞는 출처가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
