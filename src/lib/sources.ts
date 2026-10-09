import type { Source } from '@/lib/schemas'

// sourceId 목록을 출처 레지스트리 항목으로 변환 (미정의 id는 validate:data가 차단하므로 조용히 제외)
export function resolveSources(ids: string[], sources: Source[]): Source[] {
  const byId = new Map(sources.map(source => [source.id, source]))
  return ids
    .map(id => byId.get(id))
    .filter((source): source is Source => source !== undefined)
}

// 출처·신뢰도 페이지에서 해당 출처 행으로 이동하는 앵커
export function getSourceAnchorHref(id: string): string {
  return `/sources#source-${id}`
}
