import { inflateRawSync } from 'node:zlib'

const EOCD_SIGNATURE = 0x06054b50
const CENTRAL_SIGNATURE = 0x02014b50

// zip의 첫 번째 파일을 풀어 반환 (OpenDART corpCode.zip처럼 단일 파일 압축용)
export function unzipFirstEntry(buffer: Buffer): Buffer {
  let eocd = buffer.length - 22
  while (eocd >= 0 && buffer.readUInt32LE(eocd) !== EOCD_SIGNATURE) eocd -= 1
  if (eocd < 0) throw new Error('zip 형식이 아닙니다 (EOCD 없음)')

  const central = buffer.readUInt32LE(eocd + 16)
  if (buffer.readUInt32LE(central) !== CENTRAL_SIGNATURE) {
    throw new Error('zip 중앙 디렉터리를 읽을 수 없습니다')
  }
  const method = buffer.readUInt16LE(central + 10)
  const compressedSize = buffer.readUInt32LE(central + 20)
  const localHeader = buffer.readUInt32LE(central + 42)

  // 로컬 헤더의 파일명·확장 필드 길이만큼 건너뛴 곳이 데이터 시작
  const dataStart =
    localHeader +
    30 +
    buffer.readUInt16LE(localHeader + 26) +
    buffer.readUInt16LE(localHeader + 28)
  const data = buffer.subarray(dataStart, dataStart + compressedSize)

  if (method === 0) return data
  if (method === 8) return inflateRawSync(data)
  throw new Error(`지원하지 않는 zip 압축 방식: ${method}`)
}
