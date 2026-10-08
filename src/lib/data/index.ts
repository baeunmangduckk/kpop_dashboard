import { cache } from 'react'
import {
  aiVirtualDataSchema,
  concentrationDataSchema,
  fansDataSchema,
  financeDataSchema,
  globalDataSchema,
  insightsSchema,
  marketDataSchema,
  metricRegistrySchema,
  narrativesSchema,
  trendsDataSchema,
} from '@/lib/schemas'
import { loadJson } from './loader'

export { DataLoadError } from './loader'

// 한 번의 렌더링 안에서 같은 파일을 여러 컴포넌트가 요청해도 1회만 읽는다
export const getMetricRegistry = cache(() =>
  loadJson('metrics.json', metricRegistrySchema)
)
export const getInsights = cache(() =>
  loadJson('insights.json', insightsSchema)
)
export const getNarratives = cache(() =>
  loadJson('narratives.json', narrativesSchema)
)
export const getMarketData = cache(() =>
  loadJson('market.json', marketDataSchema)
)
export const getConcentrationData = cache(() =>
  loadJson('concentration.json', concentrationDataSchema)
)
export const getFinanceData = cache(() =>
  loadJson('finance.json', financeDataSchema)
)
export const getFansData = cache(() => loadJson('fans.json', fansDataSchema))
export const getGlobalData = cache(() =>
  loadJson('global.json', globalDataSchema)
)
export const getTrendsData = cache(() =>
  loadJson('trends.json', trendsDataSchema)
)
export const getAiVirtualData = cache(() =>
  loadJson('ai-virtual.json', aiVirtualDataSchema)
)
