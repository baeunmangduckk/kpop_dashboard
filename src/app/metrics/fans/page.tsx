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
  // 채널 스냅샷(구독자)을 순위 차트 형식으로 변환 - 단위는 백만 명
  const subscriberRanking: Ranking = {
    id: 'youtube-subscribers',
    title: '유튜브 구독자 Top 10',
    unit: '백만 명',
    confidence: fans.channels.confidence,
    sourceIds: fans.channels.sourceIds,
    note: fans.channels.note,
    rows: fans.channels.snapshots.map(snapshot => ({
      artist: snapshot.artist,
      value: Math.round(snapshot.subscribers / 1e5) / 10,
    })),
  }

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
          description="현재 표본은 영상 1개·댓글 500개로, 산업 전체 여론을 대표하지 않습니다."
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <VideoReaction />
            <SentimentChart />
          </div>
        </PageSection>
        <PageSection
          title="팬덤 규모 순위"
          description="플랫폼별 공식 집계 기준. 채널별 구독자·조회수 추이는 YouTube API 수집이 쌓이면(Task 013) 시계열로 제공합니다."
        >
          <div className="grid gap-4 lg:grid-cols-2">
            {[...fans.rankings, subscriberRanking].map(ranking => (
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
