import { cache } from 'react'
import type { Metric, Source } from '@/lib/schemas'
import { resolveSources } from '@/lib/sources'
import { getMetricRegistry, getSources } from '.'
import { getMetricHrefMap } from './metric-pages'

export interface MetricContext {
  byId: Map<string, Metric>
  hrefs: Map<string, string>
  sources: Source[]
  // id 목록 → 지표 (미정의 id는 validate:data가 차단하므로 조용히 제외)
  pick: (ids: string[]) => Metric[]
  sourcesOf: (ids: string[]) => Source[]
}

// 화면에서 지표를 그릴 때 필요한 조회 묶음 (서버 전용, 렌더링당 1회 계산)
export const getMetricContext = cache(async (): Promise<MetricContext> => {
  const [registry, sources, hrefs] = await Promise.all([
    getMetricRegistry(),
    getSources(),
    getMetricHrefMap(),
  ])
  const byId = new Map(registry.items.map(item => [item.id, item]))

  return {
    byId,
    hrefs,
    sources,
    pick: ids =>
      ids
        .map(id => byId.get(id))
        .filter((metric): metric is Metric => metric !== undefined),
    sourcesOf: ids => resolveSources(ids, sources),
  }
})
