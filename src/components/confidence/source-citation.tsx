import { Fragment } from 'react'
import Link from 'next/link'
import type { Source } from '@/lib/schemas'
import { getSourceAnchorHref } from '@/lib/sources'
import { cn } from '@/lib/utils'

interface SourceCitationProps {
  sources: Source[]
  // 기준일 (YYYY-MM-DD)
  asOf?: string
  className?: string
}

// 출처 표기 (F011) - 각 출처는 출처·신뢰도 페이지의 해당 행으로 이동
export function SourceCitation({
  sources,
  asOf,
  className,
}: SourceCitationProps) {
  if (sources.length === 0 && !asOf) return null

  return (
    <p
      className={cn('text-muted-foreground text-xs leading-relaxed', className)}
    >
      {sources.length > 0 && (
        <>
          출처:{' '}
          {sources.map((source, index) => (
            <Fragment key={source.id}>
              {index > 0 && ' · '}
              <Link
                href={getSourceAnchorHref(source.id)}
                title={source.title}
                className="hover:text-foreground underline-offset-4 hover:underline"
              >
                {source.publisher} {source.year}
              </Link>
            </Fragment>
          ))}
        </>
      )}
      {asOf && (
        <>
          {sources.length > 0 && ' · '}
          기준일 {asOf}
        </>
      )}
    </p>
  )
}
