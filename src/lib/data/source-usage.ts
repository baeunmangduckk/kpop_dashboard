import { cache } from 'react'
import type { Confidence } from '@/lib/schemas'
import {
  getAiVirtualData,
  getConcentrationData,
  getFansData,
  getFinanceData,
  getGlobalData,
  getInsights,
  getMarketData,
  getMetricRegistry,
  getNarratives,
  getTrendsData,
} from '.'

export interface SourceUsage {
  // 이 출처를 인용한 항목들의 신뢰도 라벨
  confidences: Set<Confidence>
  // 이 출처를 인용한 지표 id
  metricIds: string[]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

// 출처를 인용한 항목을 훑으며 라벨을 수집 (상위 블록의 confidence 상속 - validate-data와 같은 규칙)
function walk(
  node: unknown,
  inherited: Confidence | undefined,
  visit: (sourceIds: string[], confidence: Confidence | undefined) => void
): void {
  if (Array.isArray(node)) {
    node.forEach(child => walk(child, inherited, visit))
    return
  }
  if (!isRecord(node)) return
  const confidence =
    typeof node.confidence === 'string'
      ? (node.confidence as Confidence)
      : inherited
  const ids = [
    ...(Array.isArray(node.sourceIds) ? node.sourceIds : []),
    ...(typeof node.sourceId === 'string' ? [node.sourceId] : []),
  ].filter((id): id is string => typeof id === 'string')
  if (ids.length > 0) visit(ids, confidence)
  Object.values(node).forEach(child => {
    if (isRecord(child) || Array.isArray(child)) walk(child, confidence, visit)
  })
}

// 출처별 사용 현황 (출처·신뢰도 페이지용, 서버 전용)
export const getSourceUsage = cache(
  async (): Promise<Map<string, SourceUsage>> => {
    const [registry, ...datasets] = await Promise.all([
      getMetricRegistry(),
      getInsights(),
      getNarratives(),
      getMarketData(),
      getConcentrationData(),
      getFinanceData(),
      getFansData(),
      getGlobalData(),
      getTrendsData(),
      getAiVirtualData(),
    ])

    const usage = new Map<string, SourceUsage>()
    const entry = (id: string) => {
      const found = usage.get(id) ?? { confidences: new Set(), metricIds: [] }
      usage.set(id, found)
      return found
    }

    for (const metric of registry.items) {
      for (const id of metric.sourceIds) {
        entry(id).metricIds.push(metric.id)
        entry(id).confidences.add(metric.confidence)
      }
    }
    for (const data of datasets) {
      walk(data, undefined, (ids, confidence) => {
        for (const id of ids) {
          if (confidence) entry(id).confidences.add(confidence)
          else entry(id)
        }
      })
    }
    return usage
  }
)
