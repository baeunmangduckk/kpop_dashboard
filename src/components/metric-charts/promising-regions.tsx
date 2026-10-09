import { ConfidenceBadge, SourceCitation } from '@/components/confidence'
import { Badge } from '@/components/ui/badge'
import { getGlobalData, getSources } from '@/lib/data'
import { resolveSources } from '@/lib/sources'

// 유망 권역 (한류심리지수 최상위) - 정량 수치 없이 권역과 근거 설명
export async function PromisingRegions() {
  const [{ promisingRegions: block }, sources] = await Promise.all([
    getGlobalData(),
    getSources(),
  ])

  return (
    <figure className="bg-card min-w-0 space-y-3 rounded-xl border p-4 sm:p-5">
      <figcaption className="font-semibold">유망 권역</figcaption>
      <div className="flex flex-wrap gap-2">
        {block.regions.map(region => (
          <Badge key={region} variant="secondary" className="text-sm">
            {region}
          </Badge>
        ))}
      </div>
      <p className="text-muted-foreground text-sm leading-relaxed break-keep">
        {block.description}
      </p>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t pt-3">
        <ConfidenceBadge confidence={block.confidence} />
        <SourceCitation
          sources={resolveSources(block.sourceIds, sources)}
          asOf={block.asOf}
        />
      </div>
    </figure>
  )
}
