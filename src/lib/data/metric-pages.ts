import {
  getAiVirtualData,
  getConcentrationData,
  getFinanceData,
  getGlobalData,
  getMarketData,
} from '.'

/**
 * 지표 id → 해당 지표를 다루는 지표 페이지 경로 (KPI 카드·근거 지표 링크용, 서버 전용)
 * 여러 페이지에 나오면 아래 순서상 먼저 나온 페이지를 사용한다.
 */
export async function getMetricHrefMap(): Promise<Map<string, string>> {
  const [market, concentration, finance, global, aiVirtual] = await Promise.all(
    [
      getMarketData(),
      getConcentrationData(),
      getFinanceData(),
      getGlobalData(),
      getAiVirtualData(),
    ]
  )

  const pages: [string, string[]][] = [
    ['/metrics/market', market.metricIds],
    ['/metrics/concentration', concentration.metricIds],
    ['/metrics/finance', finance.metricIds],
    ['/metrics/global', global.metricIds],
    [
      '/metrics/ai-virtual',
      [...aiVirtual.metricIds, ...aiVirtual.platformMetricIds],
    ],
  ]

  const hrefs = new Map<string, string>()
  for (const [href, ids] of pages) {
    for (const id of ids) {
      if (!hrefs.has(id)) hrefs.set(id, href)
    }
  }
  return hrefs
}
