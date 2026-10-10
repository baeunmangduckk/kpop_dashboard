import { ChartFrame } from '@/components/charts'
import { NoticeBadge } from '@/components/confidence'
import { getFansData, getSources } from '@/lib/data'
import { formatCompact } from '@/lib/format'
import { frameMeta } from './frame-props'

const MISSING = '비공개'

// 영상 반응 표본 (YouTube Data API 실측) - 영상마다 규모가 크게 달라 차트 대신 표로 제시
export async function VideoReaction() {
  const [{ videos }, sources] = await Promise.all([getFansData(), getSources()])
  const rows = [...videos.items].sort((a, b) => b.views - a.views)

  return (
    <ChartFrame
      title="영상 반응"
      description={videos.note}
      method="좋아요 비율 = 좋아요 ÷ 조회수"
      notices={
        <NoticeBadge
          kind="sample"
          detail={`영상 ${rows.length}개 · ${videos.collectedAt} 수집`}
        />
      }
      {...frameMeta(videos, sources)}
      asOf={videos.collectedAt}
      table={{
        columns: [
          '영상',
          '구분',
          '게시일',
          '조회수',
          '좋아요',
          '좋아요 비율',
          '댓글',
        ],
        rows: rows.map(video => [
          video.title,
          video.artist ?? '기준 영상',
          video.publishedAt,
          formatCompact(video.views),
          video.likes === null ? MISSING : formatCompact(video.likes),
          video.likes === null || video.views === 0
            ? MISSING
            : `${((video.likes / video.views) * 100).toFixed(1)}%`,
          video.comments === null ? MISSING : formatCompact(video.comments),
        ]),
      }}
    />
  )
}
