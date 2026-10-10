import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import prettier from 'prettier'
import type { z } from 'zod'

const ROOT = process.cwd()

export const PUBLIC_DATA_DIR = path.join(ROOT, 'public', 'data')
export const RAW_DIR = path.join(ROOT, 'data', 'raw')
export const CONFIG_DIR = path.join(ROOT, 'data', 'config')

// 수집 기준일 (YYYY-MM-DD, 한국 시간)
export function today(): string {
  return new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

export const sleep = (ms: number) =>
  new Promise<void>(resolve => setTimeout(resolve, ms))

export async function readJson<T extends z.ZodType>(
  file: string,
  schema: T
): Promise<z.infer<T>> {
  const parsed = schema.safeParse(JSON.parse(await readFile(file, 'utf8')))
  if (!parsed.success) {
    throw new Error(
      `${path.relative(ROOT, file)} 검증 실패\n${parsed.error.message}`
    )
  }
  return parsed.data
}

export async function fileExists(file: string): Promise<boolean> {
  return readFile(file).then(
    () => true,
    () => false
  )
}

// 프로젝트 prettier 설정으로 포맷해 저장 (format:check 통과용)
export async function writeJson(file: string, data: unknown): Promise<void> {
  await mkdir(path.dirname(file), { recursive: true })
  const config = await prettier.resolveConfig(file)
  const text = await prettier.format(JSON.stringify(data), {
    ...config,
    parser: 'json',
  })
  await writeFile(file, text, 'utf8')
}

// API 응답 원본 보존 (출처 추적용, 키·요청 URL은 저장하지 않음)
export async function saveRaw(
  source: string,
  name: string,
  data: unknown
): Promise<string> {
  const file = path.join(RAW_DIR, source, name)
  await mkdir(path.dirname(file), { recursive: true })
  await writeFile(file, `${JSON.stringify(data, null, 2)}\n`, 'utf8')
  return path.relative(ROOT, file)
}

// 키가 포함된 URL이 오류 메시지에 남지 않도록 경로만 노출
export async function fetchJson(url: URL, label: string): Promise<unknown> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`${label} 요청 실패 (HTTP ${response.status})`)
  }
  return response.json()
}
