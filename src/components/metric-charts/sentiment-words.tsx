'use client'

import { useMemo, useState } from 'react'
import { ChartFrame, WordCloud, type CloudWord } from '@/components/charts'
import { NoticeBadge } from '@/components/confidence'
import { FilterGroup, ToggleChip } from '@/components/filters/toggle-chip'
import type { Confidence, Source } from '@/lib/schemas'
import type { SentimentWord } from '@/lib/schemas/datasets/fans'

type Lean = SentimentWord['lean']
export type WordScope = 'all' | 'mv' | 'reference'

export interface SentimentCounts {
  sampleSize: number
  positive: number
  neutral: number
  negative: number
}

interface SentimentWordsProps {
  words: Record<WordScope, SentimentWord[]>
  // 범위별 댓글 감성 개수 (범례의 비율 표기용)
  totals: Record<WordScope, SentimentCounts>
  description: string
  method: string
  collectedAt: string
  videoCount: number
  confidence: Confidence
  sources: Source[]
}

const SCOPES: { key: WordScope; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'mv', label: '뮤직비디오' },
  { key: 'reference', label: '기준 영상' },
]

// 감성은 색에 뜻이 실리므로 지정: 긍정 파랑, 중립 회색, 부정 주황 (글자용 대비 4.5:1 이상)
const LEANS: { key: Lean; label: string; color: string }[] = [
  { key: 'positive', label: '긍정', color: 'var(--sentiment-positive)' },
  { key: 'neutral', label: '중립', color: 'var(--sentiment-neutral)' },
  { key: 'negative', label: '부정', color: 'var(--sentiment-negative)' },
]
const LEAN_OF = new Map(LEANS.map(item => [item.key, item]))

const share = (value: number, total: number) =>
  `${((value / total) * 100).toFixed(1)}%`

// 댓글에 많이 나온 단어 - 범위(전체·뮤직비디오·기준 영상)를 바꿔 가며 보는 워드 클라우드
export function SentimentWords({
  words,
  totals,
  description,
  method,
  collectedAt,
  videoCount,
  confidence,
  sources,
}: SentimentWordsProps) {
  const [scope, setScope] = useState<WordScope>('all')
  const rows = words[scope]
  const total = totals[scope]

  const cloudWords = useMemo<CloudWord[]>(
    () =>
      rows.map(row => ({
        text: row.word,
        value: row.count,
        color: LEAN_OF.get(row.lean)?.color ?? 'currentColor',
        detail: `댓글 ${row.count}개 · 긍정 ${row.positive} / 중립 ${row.neutral} / 부정 ${row.negative}`,
      })),
    [rows]
  )

  return (
    <ChartFrame
      title="댓글에 많이 나온 단어"
      description={description}
      method={method}
      notices={
        <NoticeBadge
          kind="sample"
          detail={`n=${totals.all.sampleSize.toLocaleString('ko-KR')} · 영상 ${videoCount}개 · ${collectedAt} 수집`}
        />
      }
      controls={
        <div className="space-y-2">
          <FilterGroup label="범위">
            {SCOPES.map(item => (
              <ToggleChip
                key={item.key}
                label={item.label}
                pressed={scope === item.key}
                onClick={() => setScope(item.key)}
              />
            ))}
          </FilterGroup>
          <p className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            <span>
              댓글 {total.sampleSize.toLocaleString('ko-KR')}개의 감성
            </span>
            {LEANS.map(item => (
              <span key={item.key} className="flex items-center gap-1.5">
                <span
                  aria-hidden
                  className="size-2.5 shrink-0 rounded-[2px]"
                  style={{ backgroundColor: item.color }}
                />
                {item.label} {share(total[item.key], total.sampleSize)}
              </span>
            ))}
          </p>
        </div>
      }
      confidence={confidence}
      sources={sources}
      asOf={collectedAt}
      table={{
        columns: ['단어', '댓글 수', '긍정', '중립', '부정', '색'],
        rows: rows.map(row => [
          row.word,
          row.count,
          row.positive,
          row.neutral,
          row.negative,
          LEAN_OF.get(row.lean)?.label ?? row.lean,
        ]),
      }}
    >
      <WordCloud words={cloudWords} />
    </ChartFrame>
  )
}
