import path from 'node:path'
import {
  concentrationDataSchema,
  metricRegistrySchema,
} from '../../../src/lib/schemas'
import type { AlbumSales } from '../../../src/lib/schemas'
import { summarizeYear } from './concentration'
import { PUBLIC_DATA_DIR, readJson, writeJson } from './io'

const SOURCE_ID = 'circle-chart-top100'
const round = (value: number, digits: number) => Number(value.toFixed(digits))

// 원자료(연간 Top100)에서 집중도 시계열·지표를 다시 계산해 반영
export async function applyConcentration(items: AlbumSales[], asOf: string) {
  const byYear = new Map<number, number[]>()
  for (const row of items) {
    byYear.set(row.year, [...(byYear.get(row.year) ?? []), row.sales])
  }
  const years = [...byYear.keys()].sort()
  const summaries = years.map(year => summarizeYear(year, byYear.get(year)!))
  const meta = {
    confidence: 'verified' as const,
    sourceIds: [SOURCE_ID],
    asOf,
  }

  const file = path.join(PUBLIC_DATA_DIR, 'concentration.json')
  const data = await readJson(file, concentrationDataSchema)
  data.shareTrend = {
    ...meta,
    note: 'Circle Chart 연간 앨범 차트 Top100 원자료 집계, 단위 %',
    points: summaries.map(({ year, top10, top20, bottom50 }) => ({
      year,
      top10,
      top20,
      bottom50,
    })),
  }
  data.giniTrend = {
    ...meta,
    note: 'Top100 판매량의 Gini 계수 (0=균등, 1=쏠림)',
    points: summaries.map(summary => ({
      year: summary.year,
      gini: summary.gini,
    })),
  }
  data.topVsBottom = {
    ...meta,
    note: '1위·100위 앨범 판매량, 단위 장',
    points: summaries.map(summary => ({
      year: summary.year,
      first: summary.first,
      hundredth: summary.last,
    })),
  }
  data.totalSales = {
    ...meta,
    note: 'Top100 총 판매량, 단위 장',
    points: summaries.map(({ year, total }) => ({ year, total })),
  }
  await writeJson(file, data)

  // 최신 연도 지표 (증감은 화면에 표시되는 반올림 값끼리의 차이로 계산해 표와 일치시킴)
  const latest = summaries.at(-1)
  const previous = summaries.at(-2)
  if (!latest || !previous) return
  const updates = new Map<
    string,
    { value: number; delta: number; note: string; method?: string }
  >([
    [
      'sales-gini-2025',
      {
        value: latest.gini,
        delta: round(latest.gini - previous.gini, 4),
        note: '0=균등, 1=쏠림. 전년 대비 증감',
        method: '연간 Top100 판매량의 Gini 계수 (원자료 직접 집계)',
      },
    ],
    [
      'top10-share-2025',
      {
        value: latest.top10,
        delta: round(latest.top10 - previous.top10, 2),
        note: '전년 대비 %p, 낮을수록 분산',
        method: 'Top10 판매량 합 ÷ Top100 판매량 합',
      },
    ],
    [
      'top100-total-sales-2025',
      {
        value: latest.total,
        delta: latest.total - previous.total,
        note: 'Circle Chart 연간 앨범 차트 Top100 판매량 합계, 전년 대비 증감',
      },
    ],
  ])

  const metricsFile = path.join(PUBLIC_DATA_DIR, 'metrics.json')
  const registry = await readJson(metricsFile, metricRegistrySchema)
  console.log(`\n지표 반영 (${latest.year}년 vs ${previous.year}년)`)
  for (const metric of registry.items) {
    const update = updates.get(metric.id)
    if (!update) continue
    console.log(
      `  ${metric.id}: ${metric.value} (Δ ${metric.delta}) → ${update.value} (Δ ${update.delta})`
    )
    Object.assign(metric, update, {
      confidence: 'verified',
      sourceIds: [SOURCE_ID],
      asOf,
    })
  }
  await writeJson(metricsFile, registry)
}
