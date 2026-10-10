import type { Metadata } from 'next'
import { Container } from '@/components/layout/container'
import { PageHeader } from '@/components/layout/page-header'
import { PageSection } from '@/components/layout/page-section'
import { RankingChart } from '@/components/metric-charts/ranking-chart'
import { SentimentChart } from '@/components/metric-charts/sentiment-chart'
import { VideoReaction } from '@/components/metric-charts/video-reaction'
import { getFansData, getSources } from '@/lib/data'
import type { Ranking } from '@/lib/schemas'
import { getMetricPage } from '@/lib/navigation'

const page = getMetricPage('/metrics/fans')

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
}

// 팬 반응 (F006) - 영상 반응·댓글 감성·팬덤 규모 순위
export default async function FansPage() {
  const [fans, sources] = await Promise.all([getFansData(), getSources()])
  // 아티스트별 최신 스냅샷만 순위 차트 형식으로 변환
  const latest = [
    ...new Map(
      [...fans.channels.snapshots]
        .sort((x, y) => x.capturedAt.localeCompare(y.capturedAt))
        .map(snapshot => [snapshot.artist, snapshot])
    ).values(),
  ]
  const asOf = latest
    .map(snapshot => snapshot.capturedAt)
    .sort()
    .at(-1)
  const channelBlock = {
    confidence: fans.channels.confidence,
    sourceIds: fans.channels.sourceIds,
    asOf,
  }
  const channelRankings: Ranking[] = [
    {
      ...channelBlock,
      id: 'youtube-subscribers',
      title: '유튜브 구독자 Top 10',
      unit: '백만 명',
      note: fans.channels.note,
      rows: latest.map(snapshot => ({
        artist: snapshot.artist,
        value: Math.round(snapshot.subscribers / 1e5) / 10,
      })),
    },
    {
      ...channelBlock,
      id: 'youtube-channel-views',
      title: '유튜브 채널 누적 조회수',
      unit: '억 회',
      note: '공식 아티스트 채널 기준 (소속사 채널 업로드분 제외)',
      rows: latest.flatMap(snapshot =>
        snapshot.views === null
          ? []
          : [
              {
                artist: snapshot.artist,
                value: Math.round(snapshot.views / 1e7) / 10,
              },
            ]
      ),
    },
  ].filter(ranking => ranking.rows.length > 0)

  return (
    <>
      <PageHeader
        eyebrow="지표"
        title={page.title}
        description={page.description}
      />
      <Container className="space-y-12 pb-16">
        <PageSection
          title="영상 반응과 댓글 감성"
          description="영상 반응은 기준 영상과 구독자 상위 채널의 최신 뮤직비디오, 댓글 감성은 기준 영상 1개의 댓글 500개 표본으로 산업 전체 여론을 대표하지 않습니다."
        >
          <div className="space-y-4">
            <VideoReaction />
            <SentimentChart />
          </div>
        </PageSection>
        <PageSection
          title="팬덤 규모 순위"
          description="유튜브는 YouTube Data API 실측, 그 외는 플랫폼별 공개 집계 기준입니다. 채널 추이는 수집 스냅샷이 쌓이면 시계열로 제공합니다."
        >
          <div className="grid gap-4 lg:grid-cols-2">
            {[...channelRankings, ...fans.rankings].map(ranking => (
              <RankingChart
                key={ranking.id}
                ranking={ranking}
                sources={sources}
              />
            ))}
          </div>
        </PageSection>
      </Container>
    </>
  )
}
