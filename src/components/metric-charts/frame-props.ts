import type { Source, Sourced } from '@/lib/schemas'
import { resolveSources } from '@/lib/sources'

// 데이터 블록(confidence·sourceIds·asOf)을 ChartFrame 공통 props로 변환
export function frameMeta(block: Sourced, sources: Source[]) {
  return {
    confidence: block.confidence,
    sources: resolveSources(block.sourceIds, sources),
    asOf: block.asOf,
  }
}
