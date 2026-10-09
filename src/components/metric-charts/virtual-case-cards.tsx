import { ConfidenceBadge, SourceCitation } from '@/components/confidence'
import { EmptyState } from '@/components/layout/empty-state'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { getAiVirtualData, getSources } from '@/lib/data'
import type { VirtualCase } from '@/lib/schemas'
import { resolveSources } from '@/lib/sources'

const KIND_LABEL: Record<VirtualCase['kind'], string> = {
  virtual: '버추얼',
  ai: 'AI 그룹',
}

// 버추얼·AI 그룹 사례 카드
export async function VirtualCaseCards() {
  const [{ cases }, sources] = await Promise.all([
    getAiVirtualData(),
    getSources(),
  ])

  if (cases.length === 0)
    return <EmptyState message="등록된 사례가 없습니다." />

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cases.map(item => (
        <Card key={item.name} className="gap-3 py-5">
          <CardHeader className="gap-2 px-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{KIND_LABEL[item.kind]}</Badge>
              <ConfidenceBadge confidence={item.confidence} />
            </div>
            <h3 className="text-lg font-semibold">{item.name}</h3>
            <p className="text-muted-foreground text-xs">
              {item.agency} · {item.debutDate} 데뷔
            </p>
          </CardHeader>
          <CardContent className="flex-1 px-5">
            <p className="text-sm leading-relaxed break-keep">{item.summary}</p>
          </CardContent>
          <CardFooter className="px-5">
            <SourceCitation sources={resolveSources(item.sourceIds, sources)} />
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
