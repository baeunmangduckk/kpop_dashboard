import {
  ConfidenceBadge,
  NoticeBadge,
  SourceCitation,
} from '@/components/confidence'
import { getFansData, getSources } from '@/lib/data'
import { formatMetricValue } from '@/lib/format'
import { resolveSources } from '@/lib/sources'

// 등록 영상 반응 지표 (YouTube Data API 실측) - 조회수·좋아요·좋아요 비율·댓글 수
export async function VideoReaction() {
  const [{ video }, sources] = await Promise.all([getFansData(), getSources()])
  const likeRatio =
    video.views > 0 ? Math.round((video.likes / video.views) * 1000) / 10 : null
  const stats = [
    { label: '조회수', value: formatMetricValue(video.views, '회') },
    { label: '좋아요', value: formatMetricValue(video.likes, '개') },
    { label: '좋아요 비율', value: formatMetricValue(likeRatio, '%') },
    { label: '전체 댓글', value: formatMetricValue(video.comments, '개') },
  ]

  return (
    <figure className="bg-card min-w-0 space-y-4 rounded-xl border p-4 sm:p-5">
      <figcaption className="space-y-1">
        <p className="font-semibold">등록 영상 반응</p>
        <p className="text-muted-foreground text-sm break-keep">
          &ldquo;{video.title}&rdquo;
        </p>
      </figcaption>
      <NoticeBadge
        kind="sample"
        detail={`영상 1개 · ${video.collectedAt} 수집`}
      />
      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map(stat => (
          <div key={stat.label} className="space-y-1">
            <dt className="text-muted-foreground text-xs">{stat.label}</dt>
            <dd className="text-lg font-semibold tabular-nums">{stat.value}</dd>
          </div>
        ))}
      </dl>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t pt-3">
        <ConfidenceBadge
          confidence={video.confidence}
          method="좋아요 비율 = 좋아요 ÷ 조회수"
        />
        <SourceCitation
          sources={resolveSources(video.sourceIds, sources)}
          asOf={video.collectedAt}
        />
      </div>
    </figure>
  )
}
