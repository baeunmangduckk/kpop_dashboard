// Circle Chart 연간 앨범 차트 Top100 수집 → album-sales.json
// 실행: npm run collect:circlechart [-- 2025] (연도 생략 시 2011~직전 연도 전체)
// 공개 차트 페이지가 호출하는 데이터 요청을 연 1건씩, 3초 간격으로 보낸다.
import path from 'node:path'
import { z } from 'zod'
import { albumSalesDataSchema } from '../../src/lib/schemas'
import type { AlbumSales } from '../../src/lib/schemas'
import {
  PUBLIC_DATA_DIR,
  fileExists,
  readJson,
  saveRaw,
  sleep,
  today,
  writeJson,
} from './lib/io'
import { applyConcentration } from './lib/apply-concentration'
import { summarizeYear } from './lib/concentration'

const ENDPOINT = 'https://circlechart.kr/data/api/chart/album'
const PAGE = 'circlechart.kr/page_chart/album.circle?termGbn=year'
const SOURCE_ID = 'circle-chart-top100'
const FIRST_YEAR = 2011
const REQUEST_GAP_MS = 3000

const responseSchema = z.object({
  ResultStatus: z.string(),
  List: z.record(
    z.string(),
    z.object({
      SERVICE_RANKING: z.string(),
      ALBUM_NAME: z.string(),
      ARTIST_NAME: z.string(),
      Album_CNT: z.string(),
    })
  ),
})

async function fetchYear(year: number): Promise<unknown> {
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      Referer: `https://${PAGE}`,
      'X-Requested-With': 'XMLHttpRequest',
    },
    body: new URLSearchParams({
      nationGbn: 'T',
      termGbn: 'year',
      hitYear: String(year),
      targetTime: String(year).slice(2),
      yearTime: '3',
      curUrl: PAGE,
    }),
  })
  if (!response.ok) {
    throw new Error(`${year}년 요청 실패 (HTTP ${response.status})`)
  }
  return response.json()
}

async function main() {
  const date = today()
  const requested = process.argv.slice(2).map(Number).filter(Number.isInteger)
  const lastYear = Number(date.slice(0, 4)) - 1
  const years =
    requested.length > 0
      ? requested
      : Array.from(
          { length: lastYear - FIRST_YEAR + 1 },
          (_, index) => FIRST_YEAR + index
        )

  const collected: AlbumSales[] = []
  for (const [index, year] of years.entries()) {
    if (index > 0) await sleep(REQUEST_GAP_MS)
    // 차단·오류가 나면 즉시 중단 (예외로 종료)
    const raw = await fetchYear(year)
    const parsed = responseSchema.parse(raw)
    if (parsed.ResultStatus !== 'OK') {
      throw new Error(`${year}년 응답 상태: ${parsed.ResultStatus}`)
    }
    await saveRaw('circlechart', `${year}.json`, {
      collectedAt: date,
      ...parsed,
    })

    const rows = Object.values(parsed.List).flatMap(item => {
      const sales = Number(item.Album_CNT.replaceAll(',', ''))
      // 판매량 미공개 행은 집계에서 제외
      if (!Number.isInteger(sales) || sales <= 0) return []
      return [
        {
          year,
          rank: Number(item.SERVICE_RANKING),
          album: item.ALBUM_NAME.trim(),
          artist: item.ARTIST_NAME.trim(),
          sales,
          collectedAt: date,
        },
      ]
    })
    collected.push(...rows)
    const summary = summarizeYear(
      year,
      rows.map(row => row.sales)
    )
    console.log(
      `${year}: ${rows.length}/${Object.keys(parsed.List).length}행, 합계 ${summary.total.toLocaleString()}장, 1위 ${summary.first.toLocaleString()}, Top10 ${summary.top10}%, Gini ${summary.gini}`
    )
  }

  // 수집한 연도만 교체하고 나머지는 유지
  const file = path.join(PUBLIC_DATA_DIR, 'album-sales.json')
  const previous = (await fileExists(file))
    ? (await readJson(file, albumSalesDataSchema)).items
    : []
  const done = new Set(years)
  const items = [...previous.filter(row => !done.has(row.year)), ...collected]
  items.sort((a, b) => a.year - b.year || a.rank - b.rank)
  await writeJson(
    file,
    albumSalesDataSchema.parse({
      confidence: 'verified',
      sourceIds: [SOURCE_ID],
      asOf: date,
      note: 'Circle Chart 연간 앨범 차트 Top100 (국내·해외 합산), 판매량 단위 장',
      items,
    })
  )
  console.log(
    `\nalbum-sales.json ${items.length}행, 원본: data/raw/circlechart/`
  )
  await applyConcentration(items, date)
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
