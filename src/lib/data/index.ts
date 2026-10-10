import { cache } from 'react'
import type { z } from 'zod'
import { DATA_FILES } from './files'
import { loadJson } from './loader'

export { DataLoadError } from './loader'

// 한 번의 렌더링 안에서 같은 파일을 여러 컴포넌트가 요청해도 1회만 읽는다
const load = <T extends z.ZodType>(entry: { file: string; schema: T }) =>
  cache(() => loadJson(entry.file, entry.schema))

export const getMetricRegistry = load(DATA_FILES.metrics)
export const getInsights = load(DATA_FILES.insights)
export const getNarratives = load(DATA_FILES.narratives)
export const getSources = load(DATA_FILES.sources)
export const getDiscrepancies = load(DATA_FILES.discrepancies)
export const getMarketData = load(DATA_FILES.market)
export const getConcentrationData = load(DATA_FILES.concentration)
export const getFinanceData = load(DATA_FILES.finance)
export const getFansData = load(DATA_FILES.fans)
export const getGlobalData = load(DATA_FILES.global)
export const getTrendsData = load(DATA_FILES.trends)
export const getAiVirtualData = load(DATA_FILES.aiVirtual)
export const getAlbumSales = load(DATA_FILES.albumSales)
