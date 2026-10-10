// Google Trends CSV(수동 다운로드) → trends.json·global.json 국가별 관심도 적재
// 실행: npm run import:trends (파일 준비 방법: data/raw/google-trends/README.md)
import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { globalDataSchema, trendsDataSchema } from '../../src/lib/schemas'
import type { TrendPoint } from '../../src/lib/schemas'
import {
  PUBLIC_DATA_DIR,
  RAW_DIR,
  fileExists,
  readJson,
  today,
  writeJson,
} from './lib/io'

const DIR = path.join(RAW_DIR, 'google-trends')
const BASELINE = 'K-pop'
const REGION = 'Worldwide'
const TOP_COUNTRIES = 10
const RISING_PER_KEYWORD = 5
const RISING_LABELS = ['RISING', '급상승']
const TOP_LABELS = ['TOP', '인기']

// 따옴표로 감싼 값 안의 쉼표를 보존하는 한 줄 파서
function parseLine(line: string): string[] {
  const cells: string[] = []
  let cell = ''
  let quoted = false
  for (const char of line) {
    if (char === '"') quoted = !quoted
    else if (char === ',' && !quoted) {
      cells.push(cell.trim())
      cell = ''
    } else cell += char
  }
  cells.push(cell.trim())
  return cells
}

async function readLines(file: string): Promise<string[][]> {
  const text = (await readFile(file, 'utf8')).replace(/^﻿/, '')
  return text
    .split(/\r?\n/)
    .filter(line => line.trim() !== '')
    .map(parseLine)
}

// "<1"은 0.5, 빈 값은 null
function parseInterest(text: string | undefined): number | null {
  if (!text) return null
  if (text.startsWith('<')) return 0.5
  const value = Number(text.replace('%', ''))
  return Number.isFinite(value) ? value : null
}

// "BTS: (전 세계)" → "BTS"
const termOf = (header: string) => header.replace(/:\s*\(.*\)\s*$/, '').trim()

// "2021-10" → "2021-10-01", "2021-10-03"은 그대로
const toDate = (text: string) => (text.length === 7 ? `${text}-01` : text)

async function importTimeline(file: string) {
  const lines = await readLines(file)
  const headerIndex = lines.findIndex(
    cells =>
      cells.length > 1 && cells.slice(1).every(cell => cell.includes(':'))
  )
  if (headerIndex < 0) {
    throw new Error('timeline.csv에서 검색어 머리글 행을 찾지 못했습니다.')
  }
  const keywords = lines[headerIndex].slice(1).map(termOf)
  const series: TrendPoint[] = []
  for (const cells of lines.slice(headerIndex + 1)) {
    if (!/^\d{4}-\d{2}(-\d{2})?$/.test(cells[0])) continue
    keywords.forEach((keyword, index) => {
      const interest = parseInterest(cells[index + 1])
      if (interest !== null) {
        series.push({
          keyword,
          region: REGION,
          date: toDate(cells[0]),
          interest,
        })
      }
    })
  }
  if (series.length === 0) {
    throw new Error('timeline.csv에서 시계열 값을 읽지 못했습니다.')
  }
  return { keywords, series }
}

async function importRising(file: string, keyword: string) {
  const lines = await readLines(file)
  const start = lines.findIndex(cells => RISING_LABELS.includes(cells[0]))
  if (start < 0) return []
  const rows: { keyword: string; query: string; growth: number | null }[] = []
  for (const cells of lines.slice(start + 1)) {
    if (cells.length < 2 || TOP_LABELS.includes(cells[0])) break
    // "+450%"는 상승률, "급등"·"Breakout"은 수치 없음
    const growth = /^\+?[\d,]+%$/.test(cells[1])
      ? Number(cells[1].replace(/[+%,]/g, ''))
      : null
    rows.push({ keyword, query: cells[0], growth })
  }
  return rows.slice(0, RISING_PER_KEYWORD)
}

async function importGeo(file: string) {
  const lines = await readLines(file)
  return lines
    .filter(cells => cells.length === 2)
    .flatMap(([country, value]) => {
      const interest = parseInterest(value)
      // 머리글 행과 값이 없는 국가는 제외
      return interest === null || value.includes(':')
        ? []
        : [{ country, interest }]
    })
    .sort((a, b) => b.interest - a.interest)
    .slice(0, TOP_COUNTRIES)
}

async function main() {
  const timelineFile = path.join(DIR, 'timeline.csv')
  if (!(await fileExists(timelineFile))) {
    console.log(
      'data/raw/google-trends/timeline.csv가 없습니다.\n' +
        'data/raw/google-trends/README.md의 안내대로 CSV를 내려받아 넣은 뒤 다시 실행하세요.\n' +
        '(트렌드 화면은 그때까지 더미 데이터로 표시됩니다.)'
    )
    return
  }
  const date = today()
  const meta = {
    confidence: 'verified' as const,
    sourceIds: ['google-trends'],
    asOf: date,
  }

  const { keywords, series } = await importTimeline(timelineFile)
  const files = await readdir(DIR)
  const risingQueries = (
    await Promise.all(
      keywords.map(keyword => {
        const name = files.find(
          file => file.toLowerCase() === `related-${keyword}.csv`.toLowerCase()
        )
        return name ? importRising(path.join(DIR, name), keyword) : []
      })
    )
  ).flat()

  const trendsFile = path.join(PUBLIC_DATA_DIR, 'trends.json')
  const trends = await readJson(trendsFile, trendsDataSchema)
  await writeJson(
    trendsFile,
    trendsDataSchema.parse({
      ...trends,
      ...meta,
      isDummy: false,
      note: `Google Trends 웹 검색 · 전 세계 · ${series[0].date}~${series.at(-1)!.date}. 함께 비교한 검색어 안에서의 상대지수(최댓값 100)`,
      keywords,
      baselineKeyword: keywords.includes(BASELINE) ? BASELINE : keywords[0],
      series,
      risingQueries,
    })
  )
  console.log(
    `trends.json: 검색어 ${keywords.length}개(${keywords.join(', ')}), 시계열 ${series.length}점, 급상승 검색어 ${risingQueries.length}건`
  )

  const geoFile = path.join(DIR, 'geo.csv')
  if (await fileExists(geoFile)) {
    const rows = await importGeo(geoFile)
    if (rows.length === 0) {
      throw new Error('geo.csv에서 국가별 값을 읽지 못했습니다.')
    }
    const globalFile = path.join(PUBLIC_DATA_DIR, 'global.json')
    const global = await readJson(globalFile, globalDataSchema)
    global.countryInterest = {
      ...meta,
      keyword: BASELINE,
      isDummy: false,
      note: 'Google Trends 지역별 관심도 상위 국가 (인구 대비 검색 비중의 상대지수)',
      rows,
    }
    await writeJson(globalFile, global)
    console.log(`global.json: 국가별 관심도 ${rows.length}개국`)
  } else {
    console.log('geo.csv가 없어 국가별 관심도는 그대로 둡니다.')
  }
  console.log('\n반영 후 npm run validate:data 와 재빌드가 필요합니다.')
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
