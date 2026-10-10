import {
  aiVirtualDataSchema,
  albumSalesDataSchema,
  concentrationDataSchema,
  discrepanciesSchema,
  fansDataSchema,
  financeDataSchema,
  globalDataSchema,
  insightsSchema,
  marketDataSchema,
  metricRegistrySchema,
  narrativesSchema,
  sourcesSchema,
} from '@/lib/schemas'

// public/data 파일과 스키마의 단일 목록 - 페이지 로더와 검증 스크립트가 함께 사용
export const DATA_FILES = {
  metrics: { file: 'metrics.json', schema: metricRegistrySchema },
  insights: { file: 'insights.json', schema: insightsSchema },
  narratives: { file: 'narratives.json', schema: narrativesSchema },
  sources: { file: 'sources.json', schema: sourcesSchema },
  discrepancies: { file: 'discrepancies.json', schema: discrepanciesSchema },
  market: { file: 'market.json', schema: marketDataSchema },
  concentration: {
    file: 'concentration.json',
    schema: concentrationDataSchema,
  },
  finance: { file: 'finance.json', schema: financeDataSchema },
  fans: { file: 'fans.json', schema: fansDataSchema },
  global: { file: 'global.json', schema: globalDataSchema },
  aiVirtual: { file: 'ai-virtual.json', schema: aiVirtualDataSchema },
  albumSales: { file: 'album-sales.json', schema: albumSalesDataSchema },
} as const
