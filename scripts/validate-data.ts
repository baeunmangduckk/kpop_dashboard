/**
 * public/data/*.json 무결성 검증 (npm run validate:data)
 *
 * - 전체 파일 Zod 스키마 검사
 * - 신뢰도 라벨 부착률·출처 연결률 100% (F010·F011)
 * - 존재하지 않는 sourceId·metricId 참조, 중복 id, 정의되지 않은 라우트 탐지
 * 오류가 하나라도 있으면 exit 1로 종료해 check-all을 실패시킨다.
 */
import type { z } from 'zod'
import { DATA_FILES } from '@/lib/data/files'
import { DataLoadError, loadJson } from '@/lib/data/loader'
import {
  conclusionLink,
  getNarrativeHref,
  homeLink,
  metricPages,
  narratives as narrativePages,
  sourcesLink,
} from '@/lib/navigation'

const errors: string[] = []
const warnings: string[] = []

async function tryLoad<T extends z.ZodType>(entry: {
  file: string
  schema: T
}): Promise<z.infer<T> | null> {
  try {
    return await loadJson(entry.file, entry.schema)
  } catch (error) {
    errors.push(error instanceof DataLoadError ? error.message : String(error))
    return null
  }
}

function findDuplicates(ids: string[]): string[] {
  const seen = new Set<string>()
  return [...new Set(ids.filter(id => seen.has(id) || !seen.add(id)))]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function toStringArray(value: unknown): string[] {
  if (typeof value === 'string') return [value]
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string')
  }
  return []
}

interface SourcedItem {
  location: string
  labeled: boolean
  sourceIds: string[]
}

interface Reference {
  location: string
  id: string
}

// 출처를 인용한 항목(sourceIds/sourceId 보유)과 지표 참조를 수집한다.
// 신뢰도 라벨은 항목 자신 또는 상위 블록의 confidence를 상속한다 (예: 공연 전망 표의 행)
function collect(
  node: unknown,
  location: string,
  inheritedLabel: boolean,
  items: SourcedItem[],
  metricRefs: Reference[]
): void {
  if (Array.isArray(node)) {
    node.forEach((child, index) =>
      collect(child, `${location}[${index}]`, inheritedLabel, items, metricRefs)
    )
    return
  }
  if (!isRecord(node)) return

  const labeled = inheritedLabel || typeof node.confidence === 'string'
  if ('sourceIds' in node || 'sourceId' in node) {
    items.push({
      location,
      labeled,
      sourceIds: [
        ...toStringArray(node.sourceIds),
        ...toStringArray(node.sourceId),
      ],
    })
  }
  for (const key of [
    'metricId',
    'metricIds',
    'platformMetricIds',
    'homeKpiIds',
  ]) {
    for (const id of toStringArray(node[key])) {
      metricRefs.push({ location: `${location}.${key}`, id })
    }
  }
  for (const [key, child] of Object.entries(node)) {
    if (isRecord(child) || Array.isArray(child)) {
      collect(child, `${location}.${key}`, labeled, items, metricRefs)
    }
  }
}

function percent(part: number, total: number): string {
  return total === 0 ? '100.0%' : `${((part / total) * 100).toFixed(1)}%`
}

async function main(): Promise<void> {
  const metrics = await tryLoad(DATA_FILES.metrics)
  const sources = await tryLoad(DATA_FILES.sources)
  const insights = await tryLoad(DATA_FILES.insights)
  const narratives = await tryLoad(DATA_FILES.narratives)
  const conclusion = await tryLoad(DATA_FILES.conclusion)
  const loaded: { file: string; data: unknown }[] = [
    { file: DATA_FILES.metrics.file, data: metrics },
    { file: DATA_FILES.sources.file, data: sources },
    { file: DATA_FILES.insights.file, data: insights },
    { file: DATA_FILES.narratives.file, data: narratives },
    { file: DATA_FILES.conclusion.file, data: conclusion },
  ]
  const rest: { file: string; schema: z.ZodType }[] = Object.values(
    DATA_FILES
  ).filter(entry => !loaded.some(item => item.file === entry.file))
  for (const entry of rest) {
    loaded.push({ file: entry.file, data: await tryLoad(entry) })
  }
  const entries = Object.values(DATA_FILES)
  const valid = loaded.filter(item => item.data !== null)

  const metricIds = new Set(metrics?.items.map(item => item.id))
  const sourceIds = new Set(sources?.map(source => source.id))

  // 중복 id
  const duplicateChecks: [string, string[]][] = [
    ['metrics.json 지표', metrics?.items.map(item => item.id) ?? []],
    ['sources.json 출처', sources?.map(source => source.id) ?? []],
    ['insights.json 인사이트', insights?.map(insight => insight.id) ?? []],
    ['narratives.json 서사', narratives?.map(narrative => narrative.id) ?? []],
  ]
  for (const [label, ids] of duplicateChecks) {
    for (const id of findDuplicates(ids)) errors.push(`${label} id 중복: ${id}`)
  }

  // 내비게이션에 정의된 서사가 모두 데이터로 존재하는지
  if (narratives) {
    const narrativeIds = new Set<string>(narratives.map(n => n.id))
    for (const page of narrativePages) {
      if (!narrativeIds.has(page.slug)) {
        errors.push(`narratives.json에 서사 '${page.slug}' 데이터 없음`)
      }
    }
  }

  // 출처 인용 항목·지표 참조 수집 (출처 레지스트리 자체는 제외)
  const items: SourcedItem[] = []
  const metricRefs: Reference[] = []
  for (const { file, data } of valid) {
    if (file === DATA_FILES.sources.file) continue
    // 불일치 목록은 지표가 아닌 메타 정보라 라벨 부착률 집계에서 제외
    const exempt = file === DATA_FILES.discrepancies.file
    collect(data, file, exempt, items, metricRefs)
  }

  const usedSourceIds = new Set<string>()
  for (const item of items) {
    if (!item.labeled) errors.push(`신뢰도 라벨 누락: ${item.location}`)
    if (item.sourceIds.length === 0) {
      errors.push(`출처 없음: ${item.location}`)
    }
    for (const id of item.sourceIds) {
      usedSourceIds.add(id)
      if (sources && !sourceIds.has(id)) {
        errors.push(`존재하지 않는 sourceId '${id}': ${item.location}`)
      }
    }
  }
  if (metrics) {
    for (const ref of metricRefs) {
      if (!metricIds.has(ref.id)) {
        errors.push(`존재하지 않는 metricId '${ref.id}': ${ref.location}`)
      }
    }
  }

  // 모든 지표는 지표 페이지 하나 이상에 속해야 한다 (KPI 카드·근거 지표 링크 대상)
  const pageFiles = new Map(
    metricPages.map(page => [
      `${page.href.replace('/metrics/', '')}.json`,
      page.href,
    ])
  )
  const isPageMetricRef = (ref: Reference) =>
    pageFiles.has(ref.location.split('.json')[0] + '.json') &&
    /\.(metricIds|platformMetricIds)$/.test(ref.location)
  const attached = new Set(metricRefs.filter(isPageMetricRef).map(r => r.id))
  for (const id of metricIds) {
    if (!attached.has(id))
      errors.push(`지표 페이지에 연결되지 않은 지표: ${id}`)
  }

  // 출처별 실제 사용 페이지 계산: 페이지 데이터의 직접 인용 + 페이지가 참조하는 지표의 출처
  const metricSources = new Map(
    metrics?.items.map(item => [item.id, item.sourceIds])
  )
  const actualPages = new Map<string, Set<string>>()
  const markUsed = (sourceId: string, route: string) => {
    const pages = actualPages.get(sourceId) ?? new Set<string>()
    pages.add(route)
    actualPages.set(sourceId, pages)
  }
  const markMetricsUsed = (ids: string[], route: string) => {
    for (const id of ids) {
      for (const sourceId of metricSources.get(id) ?? [])
        markUsed(sourceId, route)
    }
  }
  const fileOf = (location: string) => location.split('.json')[0] + '.json'
  for (const item of items) {
    const route = pageFiles.get(fileOf(item.location))
    if (route) item.sourceIds.forEach(id => markUsed(id, route))
    if (fileOf(item.location) === DATA_FILES.discrepancies.file) {
      item.sourceIds.forEach(id => markUsed(id, sourcesLink.href))
    }
  }
  for (const ref of metricRefs) {
    const route = pageFiles.get(fileOf(ref.location))
    if (route) markMetricsUsed([ref.id], route)
  }
  markMetricsUsed(metrics?.homeKpiIds ?? [], homeLink.href)
  for (const insight of insights ?? []) {
    markMetricsUsed(insight.metricIds, homeLink.href)
  }
  for (const narrative of narratives ?? []) {
    for (const section of narrative.sections) {
      markMetricsUsed(section.metricIds, getNarrativeHref(narrative.id))
    }
  }

  for (const point of conclusion?.points ?? []) {
    markMetricsUsed(point.metricIds, conclusionLink.href)
  }

  // 출처 레지스트리의 사용 페이지가 실제 라우트·실제 사용과 일치하는지
  const routes = new Set([
    homeLink.href,
    ...narrativePages.map(page => getNarrativeHref(page.slug)),
    conclusionLink.href,
    ...metricPages.map(page => page.href),
    sourcesLink.href,
  ])
  for (const source of sources ?? []) {
    for (const page of source.pages) {
      if (!routes.has(page)) {
        errors.push(
          `정의되지 않은 라우트 '${page}': sources.json '${source.id}'`
        )
      }
    }
    if (!usedSourceIds.has(source.id) && source.pages.length > 0) {
      warnings.push(`데이터에서 참조되지 않는 출처: ${source.id}`)
    }
    const expected = [...(actualPages.get(source.id) ?? [])].sort()
    const declared = [...source.pages].sort()
    if (expected.join() !== declared.join()) {
      errors.push(
        `sources.json '${source.id}' pages 불일치 — 실제 사용: [${expected.join(', ')}]`
      )
    }
  }

  const labeledCount = items.filter(item => item.labeled).length
  const linkedCount = items.filter(
    item =>
      item.sourceIds.length > 0 && item.sourceIds.every(id => sourceIds.has(id))
  ).length
  const referenceOnly = (sources ?? []).filter(
    source => !usedSourceIds.has(source.id)
  ).length

  console.log('데이터 검증 결과')
  console.log(`  파일 스키마 통과   ${valid.length}/${entries.length}`)
  console.log(`  지표              ${metricIds.size}개`)
  console.log(
    `  출처              ${sourceIds.size}개 (참고용 ${referenceOnly}개)`
  )
  console.log(
    `  신뢰도 라벨 부착률 ${percent(labeledCount, items.length)} (${labeledCount}/${items.length})`
  )
  console.log(
    `  출처 연결률       ${percent(linkedCount, items.length)} (${linkedCount}/${items.length})`
  )
  for (const warning of warnings) console.warn(`  ⚠ ${warning}`)

  if (errors.length > 0) {
    console.error(`\n오류 ${errors.length}건`)
    for (const error of errors) console.error(`  ✖ ${error}`)
    process.exit(1)
  }
  console.log('\n✔ 모든 데이터 검증 통과')
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
