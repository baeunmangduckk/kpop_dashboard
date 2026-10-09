import {
  BarChart,
  ChartFrame,
  DistributionChart,
  TimeSeriesChart,
  type ChartSeries,
} from '@/components/charts'
import { NoticeBadge } from '@/components/confidence'
import {
  getConcentrationData,
  getFansData,
  getFinanceData,
  getMarketData,
  getSources,
} from '@/lib/data'
import { formatMetricValue } from '@/lib/format'
import { resolveSources } from '@/lib/sources'

// 개발 전용 - Task 007 차트 래퍼를 실제 데이터로 렌더링
export async function ChartShowcase() {
  const [market, concentration, finance, fans, sources] = await Promise.all([
    getMarketData(),
    getConcentrationData(),
    getFinanceData(),
    getFansData(),
    getSources(),
  ])

  const exports = market.albumExports
  const exportData = exports.points.map(point => ({
    year: point.year,
    value: point.value,
  }))

  const share = concentration.shareTrend
  const shareSeries: ChartSeries[] = [
    { key: 'top10', label: 'Top10' },
    { key: 'top20', label: 'Top20' },
    { key: 'bottom50', label: '하위50' },
  ]
  const shareData = share.points.map(point => ({
    year: point.year,
    top10: point.top10,
    top20: point.top20,
    bottom50: point.bottom50,
  }))

  // 회사(범주) × 연도(계열) - 연도 색은 2023→2025 순서로 고정
  const majors = finance.companies
    .filter(company => company.tier === 'major')
    .map(company => company.name)
  const years = [...new Set(finance.financials.map(row => row.year))].sort()
  const yearSeries: ChartSeries[] = years.map(year => ({
    key: `y${year}`,
    label: `${year}년`,
  }))
  const profitData = majors.map(company => ({
    company: company.replace('엔터테인먼트', ''),
    ...Object.fromEntries(
      years.map(year => [
        `y${year}`,
        finance.financials.find(
          row => row.company === company && row.year === year
        )?.operatingProfit ?? null,
      ])
    ),
  }))

  const sentiment = fans.sentiment
  const sentimentSeries: ChartSeries[] = [
    { key: 'positive', label: '긍정' },
    { key: 'neutral', label: '중립' },
    { key: 'negative', label: '부정' },
  ]

  return (
    <section className="space-y-4" data-showcase="charts">
      <h2 className="text-lg font-semibold">차트 래퍼 (Task 007)</h2>
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartFrame
          title="K팝 음반·DVD 수출액 추이"
          description={`단위: ${exports.unit}`}
          confidence={exports.confidence}
          sources={resolveSources(exports.sourceIds, sources)}
          table={{
            columns: ['연도', `수출액(${exports.unit})`],
            rows: exportData.map(row => [
              row.year,
              formatMetricValue(row.value, ''),
            ]),
          }}
        >
          <TimeSeriesChart
            data={exportData}
            xKey="year"
            series={[{ key: 'value', label: '수출액' }]}
            unit={exports.unit}
          />
        </ChartFrame>

        <ChartFrame
          title="Top 앨범 판매 점유율 추이"
          description="단위: %"
          confidence={share.confidence}
          sources={resolveSources(share.sourceIds, sources)}
          table={{
            columns: ['연도', ...shareSeries.map(item => item.label)],
            rows: shareData.map(row => [
              row.year,
              ...shareSeries.map(item =>
                formatMetricValue(row[item.key as 'top10'], '%')
              ),
            ]),
          }}
        >
          <TimeSeriesChart
            data={shareData}
            xKey="year"
            series={shareSeries}
            unit="%"
          />
        </ChartFrame>

        <ChartFrame
          title="상장 4사 영업이익"
          description="단위: 억원, 적자는 0 아래"
          confidence="verified"
          sources={resolveSources(['opendart'], sources)}
          table={{
            columns: ['회사', ...yearSeries.map(item => item.label)],
            rows: profitData.map(row => [
              row.company,
              ...yearSeries.map(item => {
                const value = row[item.key as keyof typeof row]
                return formatMetricValue(
                  typeof value === 'number' ? value : null,
                  ''
                )
              }),
            ]),
          }}
        >
          <BarChart
            data={profitData}
            categoryKey="company"
            series={yearSeries}
            unit="억원"
          />
        </ChartFrame>

        <ChartFrame
          title="댓글 감성 분포"
          confidence={sentiment.confidence}
          sources={resolveSources(sentiment.sourceIds, sources)}
          notices={
            <NoticeBadge
              kind="sample"
              detail={`n=${sentiment.sampleSize} · ${sentiment.collectedAt} 수집`}
            />
          }
          table={{
            columns: ['구분', '댓글 수'],
            rows: sentimentSeries.map(item => [
              item.label,
              sentiment[item.key as 'positive'],
            ]),
          }}
        >
          <DistributionChart
            data={[
              {
                label: '감성',
                positive: sentiment.positive,
                neutral: sentiment.neutral,
                negative: sentiment.negative,
              },
            ]}
            categoryKey="label"
            series={sentimentSeries}
          />
        </ChartFrame>
      </div>
    </section>
  )
}
