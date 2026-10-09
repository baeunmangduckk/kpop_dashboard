'use client'

import {
  ChartFrame,
  TimeSeriesChart,
  type ChartSeries,
} from '@/components/charts'
import { NoticeBadge } from '@/components/confidence'
import { FilterGroup, ToggleChip } from '@/components/filters/toggle-chip'
import type { Source, TrendsData } from '@/lib/schemas'
import { useTrendsFilterStore } from '@/stores/trends-filter-store'

interface TrendsExplorerProps {
  data: TrendsData
  sources: Source[]
}

// 'YYYY-MM-DD' → 'YYYY.MM' (월 단위 축 라벨)
const toMonth = (date: string) => date.slice(0, 7).replace('-', '.')

// 키워드별 검색 관심도 시계열 - 키워드 필터(Zustand)
export function TrendsExplorer({ data, sources }: TrendsExplorerProps) {
  const { hiddenKeywords, toggleKeyword, reset } = useTrendsFilterStore()
  // 키워드는 공백 등이 있어 CSS 변수명으로 쓸 수 없으므로 순서 기반 키 사용 (색도 원래 순서로 고정)
  const keyOf = (keyword: string) => `k${data.keywords.indexOf(keyword)}`
  const visible = data.keywords.filter(k => !hiddenKeywords.includes(k))
  const series: ChartSeries[] = visible.map(keyword => ({
    key: keyOf(keyword),
    label: keyword,
    color: `var(--chart-${data.keywords.indexOf(keyword) + 1})`,
  }))

  const dates = [...new Set(data.series.map(point => point.date))].sort()
  const rows = dates.map(date => ({
    month: toMonth(date),
    ...Object.fromEntries(
      data.keywords.map(keyword => [
        keyOf(keyword),
        data.series.find(p => p.date === date && p.keyword === keyword)
          ?.interest ?? null,
      ])
    ),
  }))
  const region = data.series[0]?.region ?? ''

  return (
    <div className="space-y-4">
      <div
        role="group"
        aria-label="키워드 필터"
        className="bg-card flex flex-wrap items-center gap-3 rounded-xl border p-4"
      >
        <FilterGroup label="키워드">
          {data.keywords.map(keyword => (
            <ToggleChip
              key={keyword}
              label={keyword}
              pressed={!hiddenKeywords.includes(keyword)}
              onClick={() => toggleKeyword(keyword, data.keywords.length)}
            />
          ))}
        </FilterGroup>
        <button
          type="button"
          onClick={reset}
          className="text-muted-foreground hover:text-foreground ml-auto text-xs underline-offset-4 hover:underline"
        >
          전체 보기
        </button>
      </div>
      <ChartFrame
        title="키워드별 검색 관심도 추이"
        description={`${region} · 월별 · 비교 기준 키워드: ${data.baselineKeyword}`}
        notices={
          <>
            {data.isDummy && <NoticeBadge kind="dummy" detail={data.note} />}
            <NoticeBadge kind="relative" detail="기간 내 최댓값 100 기준" />
          </>
        }
        confidence={data.confidence}
        sources={sources}
        table={{
          columns: ['월', ...series.map(item => item.label)],
          rows: rows.map(row => [
            row.month,
            ...series.map(item => {
              const value = row[item.key as keyof typeof row]
              return typeof value === 'number' ? value : '결측'
            }),
          ]),
        }}
      >
        <TimeSeriesChart data={rows} xKey="month" series={series} unit="" />
      </ChartFrame>
    </div>
  )
}
