import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { z } from 'zod'

const DATA_DIR = path.join(process.cwd(), 'public', 'data')

// 어느 파일이 왜 깨졌는지 화면·빌드 로그에서 바로 알 수 있도록 파일명을 함께 담는 에러
export class DataLoadError extends Error {
  readonly file: string

  constructor(file: string, detail: string, options?: ErrorOptions) {
    super(`[데이터 로드 실패] public/data/${file}\n${detail}`, options)
    this.name = 'DataLoadError'
    this.file = file
  }
}

/**
 * public/data/{file}을 읽어 Zod 스키마로 검증한다 (서버 전용).
 *
 * 캐시 정책: 정적 페이지는 빌드 시 1회 읽으므로 JSON을 갱신하면 재빌드가 필요하다.
 * 개발 서버에서는 요청마다 다시 읽어 수정 내용이 바로 반영된다.
 */
export async function loadJson<T extends z.ZodType>(
  file: string,
  schema: T
): Promise<z.infer<T>> {
  let raw: string
  try {
    raw = await readFile(path.join(DATA_DIR, file), 'utf-8')
  } catch (error) {
    throw new DataLoadError(file, '파일을 읽을 수 없습니다.', { cause: error })
  }

  let json: unknown
  try {
    json = JSON.parse(raw)
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    throw new DataLoadError(file, `JSON 형식 오류: ${reason}`, {
      cause: error,
    })
  }

  const result = schema.safeParse(json)
  if (!result.success) {
    throw new DataLoadError(
      file,
      `스키마 검증 실패:\n${z.prettifyError(result.error)}`
    )
  }
  return result.data
}
