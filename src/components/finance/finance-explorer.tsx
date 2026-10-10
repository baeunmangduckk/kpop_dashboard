'use client'

import { BarChart, ChartFrame, type ChartSeries } from '@/components/charts'
import { FilterGroup, ToggleChip } from '@/components/filters/toggle-chip'
import { Button } from '@/components/ui/button'
import { describeChange, operatingMargin } from '@/lib/finance'
import { formatMetricValue } from '@/lib/format'
import type { CompanyFinancial, Source } from '@/lib/schemas'
import { useFinanceFilterStore } from '@/stores/finance-filter-store'

interface FinanceExplorerProps {
  companies: string[]
  // 처음에 숨길 회사 (사용자가 필터를 건드리기 전까지 적용)
  defaultHidden?: string[]
  financials: CompanyFinancial[]
  sources: Source[]
}

type MeasureKey = 'revenue' | 'operatingProfit' | 'margin'

const MEASURES: { key: MeasureKey; title: string; unit: string }[] = [
  { key: 'revenue', title: '매출액', unit: '억원' },
  { key: 'operatingProfit', title: '영업이익', unit: '억원' },
  { key: 'margin', title: '영업이익률', unit: '%' },
]

// 회사 이름 축약 (좁은 화면 축 라벨용)
const shortName = (company: string) => company.replace('엔터테인먼트', '')

function measureOf(row: CompanyFinancial | undefined, key: MeasureKey) {
  if (!row) return null
  return key === 'margin' ? operatingMargin(row) : row[key]
}

// 기획사 재무 탐색 - 회사·연도 필터(Zustand)와 지표별 막대 차트·실적 요약
export function FinanceExplorer({
  companies,
  defaultHidden = [],
  financials,
  sources,
}: FinanceExplorerProps) {
  const { hiddenYears, toggleCompany, toggleYear, reset } =
    useFinanceFilterStore()
  const hiddenCompanies =
    useFinanceFilterStore(state => state.hiddenCompanies) ?? defaultHidden

  const allYears = [...new Set(financials.map(row => row.year))].sort()
  const visibleCompanies = companies.filter(c => !hiddenCompanies.includes(c))
  const visibleYears = allYears.filter(y => !hiddenYears.includes(y))
  // 연도 색은 필터와 무관하게 고정 (색은 대상을 따라감)
  const yearSeries: ChartSeries[] = visibleYears.map(year => ({
    key: `y${year}`,
    label: `${year}년`,
    color: `var(--chart-${allYears.indexOf(year) + 1})`,
  }))
  const find = (company: string, year: number) =>
    financials.find(row => row.company === company && row.year === year)
  const confidence = financials.every(row => row.confidence === 'verified')
    ? 'verified'
    : 'estimated'

  const latestYear = visibleYears[visibleYears.length - 1]
  const summaryRows = visibleCompanies.map(company => {
    const current = find(company, latestYear)
    const previous = find(company, latestYear - 1)
    return [
      company,
      formatMetricValue(current?.revenue ?? null, ''),
      formatMetricValue(current?.operatingProfit ?? null, ''),
      formatMetricValue(current ? operatingMargin(current) : null, '%'),
      describeChange(current?.revenue ?? null, previous?.revenue ?? null),
      describeChange(
        current?.operatingProfit ?? null,
        previous?.operatingProfit ?? null
      ),
    ]
  })

  return (
    <div className="space-y-6">
      <div
        role="group"
        aria-label="재무 필터"
        className="bg-card flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:flex-wrap sm:items-center"
      >
        <FilterGroup label="회사">
          {companies.map(company => (
            <ToggleChip
              key={company}
              label={shortName(company)}
              pressed={!hiddenCompanies.includes(company)}
              onClick={() =>
                toggleCompany(company, companies.length, hiddenCompanies)
              }
            />
          ))}
        </FilterGroup>
        <FilterGroup label="연도">
          {allYears.map(year => (
            <ToggleChip
              key={year}
              label={`${year}`}
              pressed={!hiddenYears.includes(year)}
              onClick={() => toggleYear(year, allYears.length)}
            />
          ))}
        </FilterGroup>
        <Button
          variant="ghost"
          size="sm"
          onClick={reset}
          className="sm:ml-auto"
        >
          전체 보기
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {MEASURES.map(measure => {
          const data = visibleCompanies.map(company => ({
            company: shortName(company),
            ...Object.fromEntries(
              visibleYears.map(year => [
                `y${year}`,
                measureOf(find(company, year), measure.key),
              ])
            ),
          }))
          return (
            <ChartFrame
              key={measure.key}
              title={`회사별 ${measure.title}`}
              description={`단위: ${measure.unit}${measure.key !== 'revenue' ? ' · 적자는 0 아래' : ''}`}
              confidence={confidence}
              method={
                measure.key === 'margin'
                  ? '영업이익 ÷ 매출액 (공시값으로 계산)'
                  : undefined
              }
              sources={sources}
              table={{
                columns: ['회사', ...yearSeries.map(item => item.label)],
                rows: data.map(row => [
                  row.company,
                  ...yearSeries.map(item => {
                    const value = row[item.key as keyof typeof row]
                    return formatMetricValue(
                      typeof value === 'number' ? value : null,
                      measure.unit === '%' ? '%' : ''
                    )
                  }),
                ]),
              }}
            >
              <BarChart
                data={data}
                categoryKey="company"
                series={yearSeries}
                unit={measure.unit}
              />
            </ChartFrame>
          )
        })}
      </div>

      <ChartFrame
        title={`${latestYear}년 실적 요약`}
        description="단위: 억원 · 증감은 전년 대비 (적자 전환·흑자 전환은 증감률 대신 상태로 표시)"
        confidence={confidence}
        sources={sources}
        table={{
          columns: [
            '회사',
            '매출액',
            '영업이익',
            '이익률',
            '매출 증감',
            '영업이익 증감',
          ],
          rows: summaryRows,
        }}
      />
    </div>
  )
}
