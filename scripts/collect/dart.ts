// OpenDART 사업보고서 주요계정 수집 → finance.json 연간 재무·합산 지표 갱신
// 실행: npm run collect:dart
import path from 'node:path'
import { z } from 'zod'
import { financeDataSchema, metricRegistrySchema } from '../../src/lib/schemas'
import type { CompanyFinancial, Metric } from '../../src/lib/schemas'
import { requireEnv } from './env'
import {
  CONFIG_DIR,
  PUBLIC_DATA_DIR,
  fetchJson,
  readJson,
  saveRaw,
  sleep,
  today,
  writeJson,
} from './lib/io'
import { unzipFirstEntry } from './lib/zip'

const API = 'https://opendart.fss.or.kr/api'
// 사업보고서
const ANNUAL_REPORT = '11011'
const SOURCE_ID = 'opendart'
const UNIT = 100_000_000

const configSchema = z.object({
  years: z.array(z.number().int()).min(1),
  companies: z.array(
    z.object({
      name: z.string().min(1),
      tier: z.enum(['major', 'mid']),
      stockCode: z.string().length(6).optional(),
      // 최초 조회 후 고정되는 DART 고유번호
      corpCode: z.string().length(8).optional(),
      // 종목코드를 모를 때 회사명 일부로 조회
      nameQuery: z.string().min(1).optional(),
    })
  ),
})

const accountSchema = z.object({
  fs_div: z.string(),
  sj_div: z.string(),
  account_nm: z.string(),
  thstrm_amount: z.string().optional(),
})

const responseSchema = z.object({
  status: z.string(),
  message: z.string(),
  list: z.array(accountSchema).optional(),
})

interface Corp {
  corpCode: string
  corpName: string
  stockCode: string
}

const REVENUE_NAMES = ['매출액', '수익(매출액)', '영업수익']
const PROFIT_NAMES = ['영업이익', '영업이익(손실)']

const round = (value: number, digits = 2) => Number(value.toFixed(digits))

async function fetchCorps(key: string): Promise<Corp[]> {
  const url = new URL(`${API}/corpCode.xml`)
  url.searchParams.set('crtfc_key', key)
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`corpCode 요청 실패 (HTTP ${response.status})`)
  }
  const buffer = Buffer.from(await response.arrayBuffer())
  // 오류일 때는 zip 대신 XML 메시지가 온다
  if (buffer.subarray(0, 2).toString() !== 'PK') {
    const message = /<message>(.*?)<\/message>/.exec(buffer.toString('utf8'))
    throw new Error(`corpCode 오류: ${message?.[1] ?? '알 수 없는 응답'}`)
  }
  const xml = unzipFirstEntry(buffer).toString('utf8')
  const corps: Corp[] = []
  const pattern =
    /<corp_code>(\d+)<\/corp_code>\s*<corp_name>([^<]*)<\/corp_name>[\s\S]*?<stock_code>([^<]*)<\/stock_code>/g
  for (const match of xml.matchAll(pattern)) {
    const stockCode = match[3].trim()
    // 상장사만 (비상장은 종목코드 공란)
    if (stockCode) {
      corps.push({ corpCode: match[1], corpName: match[2].trim(), stockCode })
    }
  }
  return corps
}

const filingListSchema = z.object({
  status: z.string(),
  message: z.string(),
  total_page: z.number().optional(),
  list: z
    .array(
      z.object({
        corp_code: z.string(),
        corp_name: z.string(),
        stock_code: z.string(),
      })
    )
    .optional(),
})

// corpCode.xml이 점검 중일 때의 대체 경로: 사업보고서 제출 목록에서 고유번호 확인
async function fetchCorpsFromFilings(key: string, year: number) {
  const corps = new Map<string, Corp>()
  for (let page = 1, total = 1; page <= total; page += 1) {
    const url = new URL(`${API}/list.json`)
    url.searchParams.set('crtfc_key', key)
    // 12월 결산 법인의 사업보고서 제출 기간
    url.searchParams.set('bgn_de', `${year + 1}0301`)
    url.searchParams.set('end_de', `${year + 1}0430`)
    url.searchParams.set('pblntf_detail_ty', 'A001')
    url.searchParams.set('page_count', '100')
    url.searchParams.set('page_no', String(page))
    const data = filingListSchema.parse(await fetchJson(url, '공시 목록'))
    if (data.status !== '000') {
      throw new Error(`공시 목록 오류: ${data.status} ${data.message}`)
    }
    total = data.total_page ?? 1
    for (const item of data.list ?? []) {
      const stockCode = item.stock_code.trim()
      if (stockCode) {
        corps.set(item.corp_code, {
          corpCode: item.corp_code,
          corpName: item.corp_name.trim(),
          stockCode,
        })
      }
    }
    await sleep(200)
  }
  return [...corps.values()]
}

function parseAmount(text: string | undefined): number | null {
  if (!text) return null
  const value = Number(text.replaceAll(',', ''))
  return Number.isFinite(value) && text.trim() !== '' ? value : null
}

function pickAccount(
  list: z.infer<typeof accountSchema>[],
  names: string[]
): number | null {
  // 연결(CFS) 우선, 없으면 별도(OFS)
  for (const division of ['CFS', 'OFS']) {
    const found = list.find(
      item =>
        item.fs_div === division &&
        item.sj_div !== 'BS' &&
        names.includes(item.account_nm.trim())
    )
    const amount = parseAmount(found?.thstrm_amount)
    if (amount !== null) return round(amount / UNIT)
  }
  return null
}

function updateMetric(
  metrics: Metric[],
  id: string,
  value: number,
  delta: number | null
): string | null {
  const metric = metrics.find(item => item.id === id)
  if (!metric) return null
  if (metric.value === value && metric.delta === delta) return null
  const before = `${metric.value} (Δ ${metric.delta})`
  metric.value = value
  metric.delta = delta
  return `  ${id}: ${before} → ${value} (Δ ${delta})`
}

async function main() {
  const { DART_API_KEY } = requireEnv('DART_API_KEY')
  const date = today()
  const configFile = path.join(CONFIG_DIR, 'dart-companies.json')
  const config = await readJson(configFile, configSchema)

  // 고유번호가 고정되지 않은 회사가 있을 때만 조회
  let corps: Corp[] = []
  if (config.companies.some(company => !company.corpCode)) {
    try {
      corps = await fetchCorps(DART_API_KEY)
    } catch (error) {
      console.log(error instanceof Error ? error.message : error)
      console.log('→ 사업보고서 제출 목록으로 대체 조회')
      corps = await fetchCorpsFromFilings(DART_API_KEY, config.years.at(-1)!)
    }
    console.log(`상장사 고유번호 ${corps.length}건 조회`)
  }

  const collected: CompanyFinancial[] = []
  const skipped: string[] = []

  for (const company of config.companies) {
    const matches: Corp[] = company.corpCode
      ? [
          {
            corpCode: company.corpCode,
            corpName: company.name,
            stockCode: company.stockCode ?? company.corpCode,
          },
        ]
      : corps.filter(corp =>
          company.stockCode
            ? corp.stockCode === company.stockCode
            : corp.corpName.includes(company.nameQuery ?? company.name)
        )
    if (matches.length !== 1) {
      const names = matches.map(corp => corp.corpName).join(', ') || '없음'
      skipped.push(`${company.name} (상장사 조회 결과: ${names})`)
      continue
    }
    const corp = matches[0]
    company.corpCode = corp.corpCode
    company.stockCode = corp.stockCode
    console.log(`${company.name} → ${corp.corpName} (${corp.stockCode})`)

    for (const year of config.years) {
      const url = new URL(`${API}/fnlttSinglAcnt.json`)
      url.searchParams.set('crtfc_key', DART_API_KEY)
      url.searchParams.set('corp_code', corp.corpCode)
      url.searchParams.set('bsns_year', String(year))
      url.searchParams.set('reprt_code', ANNUAL_REPORT)
      const raw = await fetchJson(url, `${company.name} ${year}`)
      await saveRaw('dart', `${date}/${corp.stockCode}-${year}.json`, raw)

      const parsed = responseSchema.parse(raw)
      // 013: 조회된 데이터 없음 (미공시 연도)
      if (parsed.status !== '000' && parsed.status !== '013') {
        throw new Error(
          `${company.name} ${year}: ${parsed.status} ${parsed.message}`
        )
      }
      const list = parsed.list ?? []
      collected.push({
        company: company.name,
        year,
        revenue: pickAccount(list, REVENUE_NAMES),
        operatingProfit: pickAccount(list, PROFIT_NAMES),
        confidence: 'verified',
        sourceIds: [SOURCE_ID],
      })
      await sleep(300)
    }
  }

  await writeJson(configFile, config)

  // finance.json 갱신 (기존 값과 대조)
  const financeFile = path.join(PUBLIC_DATA_DIR, 'finance.json')
  const finance = await readJson(financeFile, financeDataSchema)
  const previous = new Map(
    finance.financials.map(row => [`${row.company}|${row.year}`, row])
  )
  console.log('\n기존 값 대조')
  for (const row of collected) {
    const old = previous.get(`${row.company}|${row.year}`)
    if (!old) {
      console.log(
        `  + ${row.company} ${row.year}: 매출 ${row.revenue}, 영업이익 ${row.operatingProfit}`
      )
    } else if (
      old.revenue !== row.revenue ||
      old.operatingProfit !== row.operatingProfit
    ) {
      console.log(
        `  ~ ${row.company} ${row.year}: 매출 ${old.revenue} → ${row.revenue}, 영업이익 ${old.operatingProfit} → ${row.operatingProfit}`
      )
    }
  }
  const collectedNames = new Set(collected.map(row => row.company))
  finance.financials = [
    ...finance.financials.filter(row => !collectedNames.has(row.company)),
    ...collected,
  ].sort(
    (a, b) =>
      finance.companies.findIndex(c => c.name === a.company) -
        finance.companies.findIndex(c => c.name === b.company) ||
      a.year - b.year
  )
  await writeJson(financeFile, finance)

  // 합산 지표 재계산 (상장 4사, 최신 연도 vs 전년)
  const metricsFile = path.join(PUBLIC_DATA_DIR, 'metrics.json')
  const registry = await readJson(metricsFile, metricRegistrySchema)
  const majors = new Set(
    finance.companies.filter(c => c.tier === 'major').map(c => c.name)
  )
  const sum = (year: number, field: 'revenue' | 'operatingProfit') =>
    finance.financials
      .filter(row => majors.has(row.company) && row.year === year)
      .reduce((total, row) => total + (row[field] ?? 0), 0)
  const of = (company: string, year: number) =>
    finance.financials.find(row => row.company === company && row.year === year)
  const margin = (profit: number, revenue: number) => (profit / revenue) * 100

  const [revenue, prevRevenue] = [sum(2025, 'revenue'), sum(2024, 'revenue')]
  const [profit, prevProfit] = [
    sum(2025, 'operatingProfit'),
    sum(2024, 'operatingProfit'),
  ]
  const hybe = of('하이브', 2025)
  const hybePrev = of('하이브', 2024)
  const changes = [
    updateMetric(
      registry.items,
      'big4-revenue-2025',
      round(revenue, 1),
      round(revenue - prevRevenue, 1)
    ),
    updateMetric(
      registry.items,
      'big4-operating-profit-2025',
      round(profit, 1),
      round(profit - prevProfit, 1)
    ),
    updateMetric(
      registry.items,
      'big4-operating-margin-2025',
      round(margin(profit, revenue), 1),
      round(margin(profit, revenue) - margin(prevProfit, prevRevenue), 1)
    ),
  ]
  if (
    hybe?.revenue &&
    hybe.operatingProfit !== null &&
    hybePrev?.revenue &&
    hybePrev.operatingProfit !== null
  ) {
    const now = margin(hybe.operatingProfit, hybe.revenue)
    const before = margin(hybePrev.operatingProfit, hybePrev.revenue)
    changes.push(
      updateMetric(
        registry.items,
        'hybe-operating-profit-2025',
        hybe.operatingProfit,
        round(hybe.operatingProfit - hybePrev.operatingProfit)
      ),
      updateMetric(
        registry.items,
        'hybe-operating-margin-2025',
        round(now),
        round(now - before, 1)
      )
    )
  }
  const changed = changes.filter(line => line !== null)
  console.log(`\n지표 변경 ${changed.length}건`)
  changed.forEach(line => console.log(line))
  if (changed.length > 0) await writeJson(metricsFile, registry)

  if (skipped.length > 0) {
    console.log('\n수집 제외 (상장사 고유번호를 하나로 특정하지 못함)')
    skipped.forEach(line => console.log(`  ${line}`))
  }
  console.log(`\n원본: data/raw/dart/${date}/ (${collected.length}건)`)
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
