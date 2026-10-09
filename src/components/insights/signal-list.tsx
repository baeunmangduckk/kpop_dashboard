import { ConfidenceBadge, SourceCitation } from '@/components/confidence'
import type { Signal } from '@/lib/schemas'
import type { Source } from '@/lib/schemas'
import { resolveSources } from '@/lib/sources'
import { ToneLabel } from './tone-label'

interface SignalListProps {
  signals: Signal[]
  sources: Source[]
}

// 지속가능성 리스크·기회 신호 목록 - 신호마다 신뢰도·출처 표기
export function SignalList({ signals, sources }: SignalListProps) {
  return (
    <ul className="grid gap-3 md:grid-cols-2">
      {signals.map(signal => (
        <li
          key={signal.title}
          className="bg-card space-y-2 rounded-xl border p-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <ToneLabel tone={signal.tone} />
            <ConfidenceBadge confidence={signal.confidence} />
          </div>
          <p className="font-medium break-keep">{signal.title}</p>
          <p className="text-muted-foreground text-sm leading-relaxed break-keep">
            {signal.detail}
          </p>
          <SourceCitation
            sources={resolveSources(signal.sourceIds, sources)}
            asOf={signal.asOf}
          />
        </li>
      ))}
    </ul>
  )
}
