// YouTube Data API v3 수집 → fans.json 채널 스냅샷·영상 반응 갱신
// 실행: npm run collect:youtube (대상은 data/config/youtube-targets.json에 고정)
import path from 'node:path'
import { z } from 'zod'
import { fansDataSchema } from '../../src/lib/schemas'
import { requireEnv } from './env'
import {
  CONFIG_DIR,
  PUBLIC_DATA_DIR,
  readJson,
  saveRaw,
  today,
  writeJson,
} from './lib/io'

const API = 'https://www.googleapis.com/youtube/v3'
const SOURCE_ID = 'youtube-data-api'
// 업로드 목록에서 최신 MV를 찾을 때 훑는 최대 페이지 (50개/쪽)
const MAX_UPLOAD_PAGES = 40
const MV_PATTERN = /M\/V|\bMV\b|Official Video|Official Music Video/i
const NON_MV_PATTERN =
  /teaser|티저|trailer|making|behind|performance|practice|reaction|shorts|preview|highlight|live clip|special video|lyric|ver/i

const configSchema = z.object({
  channels: z.array(
    z.object({
      artist: z.string().min(1),
      handle: z.string().startsWith('@'),
      channelId: z.string().optional(),
      // MV가 소속사 채널에 올라오는 경우
      mvChannelHandle: z.string().startsWith('@').optional(),
      // 소속사 채널 제목에서 아티스트를 가려낼 키워드 (기본: artist)
      titleKeyword: z.string().optional(),
    })
  ),
  referenceVideo: z.object({
    title: z.string().min(1),
    id: z.string().optional(),
  }),
  videos: z.array(
    z.object({
      id: z.string().min(1),
      artist: z.string().min(1),
      title: z.string().min(1),
    })
  ),
})

type Config = z.infer<typeof configSchema>

const count = z.coerce.number().int().nonnegative()

const channelListSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string(),
        snippet: z.object({ title: z.string() }).optional(),
        statistics: z
          .object({
            subscriberCount: count.optional(),
            viewCount: count.optional(),
          })
          .optional(),
        contentDetails: z
          .object({ relatedPlaylists: z.object({ uploads: z.string() }) })
          .optional(),
      })
    )
    .default([]),
})

const playlistItemsSchema = z.object({
  nextPageToken: z.string().optional(),
  items: z.array(
    z.object({
      snippet: z.object({
        title: z.string(),
        resourceId: z.object({ videoId: z.string() }),
      }),
    })
  ),
})

const searchSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.object({ videoId: z.string() }),
        snippet: z.object({ title: z.string(), channelTitle: z.string() }),
      })
    )
    .default([]),
})

const videoListSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      snippet: z.object({ title: z.string(), publishedAt: z.string() }),
      statistics: z.object({
        viewCount: count,
        // 좋아요 비공개·댓글 차단 영상은 항목이 없음
        likeCount: count.optional(),
        commentCount: count.optional(),
      }),
    })
  ),
})

const commentThreadsSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string(),
        snippet: z.object({
          topLevelComment: z.object({
            snippet: z.object({
              textOriginal: z.string(),
              likeCount: z.number(),
              publishedAt: z.string(),
            }),
          }),
          totalReplyCount: z.number(),
        }),
      })
    )
    .default([]),
})

const apiErrorSchema = z.object({
  error: z.object({
    message: z.string(),
    errors: z.array(z.object({ reason: z.string() })).optional(),
  }),
})

class YouTubeError extends Error {
  constructor(
    message: string,
    readonly reason?: string
  ) {
    super(message)
  }
}

function createClient(key: string) {
  let units = 0
  async function call(
    resource: string,
    params: Record<string, string>,
    cost = 1
  ): Promise<unknown> {
    const url = new URL(`${API}/${resource}`)
    for (const [name, value] of Object.entries(params)) {
      url.searchParams.set(name, value)
    }
    url.searchParams.set('key', key)
    units += cost
    const response = await fetch(url)
    const body: unknown = await response.json()
    if (!response.ok) {
      const parsed = apiErrorSchema.safeParse(body)
      throw new YouTubeError(
        `${resource} 요청 실패 (HTTP ${response.status}): ${parsed.success ? parsed.data.error.message : '알 수 없는 오류'}`,
        parsed.success ? parsed.data.error.errors?.[0]?.reason : undefined
      )
    }
    return body
  }
  return { call, units: () => units }
}

type Client = ReturnType<typeof createClient>

// 채널 ID·영상 목록을 최초 1회 찾아 설정 파일에 고정
async function resolveTargets(client: Client, config: Config) {
  let changed = false

  for (const channel of config.channels) {
    if (channel.channelId) continue
    const { items } = channelListSchema.parse(
      await client.call('channels', {
        part: 'snippet,statistics',
        forHandle: channel.handle,
      })
    )
    if (items.length === 0) {
      throw new Error(`채널을 찾지 못했습니다: ${channel.handle}`)
    }
    channel.channelId = items[0].id
    changed = true
    console.log(
      `  채널 ${channel.artist}: ${items[0].snippet?.title} (${channel.handle}, 구독자 ${items[0].statistics?.subscriberCount ?? '비공개'})`
    )
  }

  if (!config.referenceVideo.id) {
    const { items } = searchSchema.parse(
      await client.call(
        'search',
        {
          part: 'snippet',
          type: 'video',
          maxResults: '5',
          q: config.referenceVideo.title,
        },
        100
      )
    )
    const wanted = config.referenceVideo.title.toLowerCase()
    const hit = items.find(item =>
      item.snippet.title.toLowerCase().includes(wanted)
    )
    if (!hit) {
      throw new Error(
        `기준 영상을 찾지 못했습니다: ${config.referenceVideo.title}`
      )
    }
    config.referenceVideo.id = hit.id.videoId
    changed = true
    console.log(
      `  기준 영상: ${hit.snippet.title} (${hit.snippet.channelTitle}, ${hit.id.videoId})`
    )
  }

  // 영상이 아직 고정되지 않은 아티스트만 탐색
  const pending = config.channels.filter(
    channel => !config.videos.some(video => video.artist === channel.artist)
  )
  if (pending.length > 0) {
    const uploads = new Map<string, string>()
    for (const channel of pending) {
      const handle = channel.mvChannelHandle ?? channel.handle
      if (!uploads.has(handle)) {
        const { items } = channelListSchema.parse(
          await client.call('channels', {
            part: 'contentDetails',
            forHandle: handle,
          })
        )
        const playlist = items[0]?.contentDetails?.relatedPlaylists.uploads
        if (!playlist) throw new Error(`업로드 목록이 없습니다: ${handle}`)
        uploads.set(handle, playlist)
      }
      const keyword = (channel.titleKeyword ?? channel.artist).toLowerCase()
      let pageToken: string | undefined
      let found: { id: string; title: string } | undefined
      for (let page = 0; page < MAX_UPLOAD_PAGES && !found; page += 1) {
        const data = playlistItemsSchema.parse(
          await client.call('playlistItems', {
            part: 'snippet',
            maxResults: '50',
            playlistId: uploads.get(handle)!,
            ...(pageToken ? { pageToken } : {}),
          })
        )
        const hit = data.items.find(
          ({ snippet }) =>
            // 유닛·피처링 영상을 피하려고 제목이 아티스트명으로 시작하는 것만
            snippet.title.toLowerCase().replace(/^#/, '').startsWith(keyword) &&
            MV_PATTERN.test(snippet.title) &&
            !NON_MV_PATTERN.test(snippet.title)
        )
        if (hit) {
          found = {
            id: hit.snippet.resourceId.videoId,
            title: hit.snippet.title,
          }
        }
        pageToken = data.nextPageToken
        if (!pageToken) break
      }
      if (!found) {
        console.log(`  MV 미발견: ${channel.artist} (${handle})`)
        continue
      }
      config.videos.push({ ...found, artist: channel.artist })
      changed = true
      console.log(`  MV ${channel.artist}: ${found.title} (${found.id})`)
    }
  }

  return changed
}

async function main() {
  const { YOUTUBE_API_KEY } = requireEnv('YOUTUBE_API_KEY')
  const client = createClient(YOUTUBE_API_KEY)
  const date = today()
  const configFile = path.join(CONFIG_DIR, 'youtube-targets.json')
  const config = await readJson(configFile, configSchema)

  console.log('대상 확인')
  if (await resolveTargets(client, config)) {
    await writeJson(configFile, config)
    console.log('  → data/config/youtube-targets.json에 고정')
  }

  // 채널 스냅샷
  const channelIds = config.channels.map(channel => channel.channelId!)
  const channelsRaw = await client.call('channels', {
    part: 'snippet,statistics',
    id: channelIds.join(','),
    maxResults: '50',
  })
  await saveRaw('youtube', `${date}/channels.json`, channelsRaw)
  const channelById = new Map(
    channelListSchema.parse(channelsRaw).items.map(item => [item.id, item])
  )

  // 영상 반응
  const targets = [
    {
      id: config.referenceVideo.id!,
      artist: null as string | null,
      kind: 'reference' as const,
    },
    ...config.videos.map(video => ({
      id: video.id,
      artist: video.artist as string | null,
      kind: 'mv' as const,
    })),
  ]
  const videosRaw = await client.call('videos', {
    part: 'snippet,statistics',
    id: targets.map(target => target.id).join(','),
    maxResults: '50',
  })
  await saveRaw('youtube', `${date}/videos.json`, videosRaw)
  const videoById = new Map(
    videoListSchema.parse(videosRaw).items.map(item => [item.id, item])
  )

  // 댓글 원본 (감성 분류기가 없어 저장만, 작성자 식별 정보는 제외)
  let commentTotal = 0
  for (const target of targets) {
    try {
      const raw = await client.call('commentThreads', {
        part: 'snippet',
        videoId: target.id,
        maxResults: '100',
        order: 'relevance',
        textFormat: 'plainText',
      })
      const comments = commentThreadsSchema.parse(raw).items.map(item => ({
        id: item.id,
        text: item.snippet.topLevelComment.snippet.textOriginal,
        likeCount: item.snippet.topLevelComment.snippet.likeCount,
        replyCount: item.snippet.totalReplyCount,
        publishedAt: item.snippet.topLevelComment.snippet.publishedAt,
      }))
      commentTotal += comments.length
      await saveRaw('youtube', `${date}/comments/${target.id}.json`, {
        videoId: target.id,
        collectedAt: date,
        order: 'relevance',
        comments,
      })
    } catch (error) {
      // 댓글이 차단된 영상은 건너뜀
      if (error instanceof YouTubeError && error.reason === 'commentsDisabled')
        continue
      throw error
    }
  }

  // fans.json 갱신
  const fansFile = path.join(PUBLIC_DATA_DIR, 'fans.json')
  const fans = await readJson(fansFile, fansDataSchema)

  const snapshots = config.channels.flatMap(channel => {
    const item = channelById.get(channel.channelId!)
    const subscribers = item?.statistics?.subscriberCount
    if (subscribers === undefined) return []
    return [
      {
        artist: channel.artist,
        subscribers,
        views: item?.statistics?.viewCount ?? null,
        capturedAt: date,
      },
    ]
  })
  // API 수집분만 누적 (같은 날 재실행 시 교체), 이전 출처의 스냅샷은 제외
  const kept =
    fans.channels.sourceIds.includes(SOURCE_ID) &&
    fans.channels.confidence === 'verified'
      ? fans.channels.snapshots.filter(row => row.capturedAt !== date)
      : []
  fans.channels = {
    confidence: 'verified',
    sourceIds: [SOURCE_ID],
    note: '구독자 수는 YouTube가 유효숫자 3자리로 반올림해 제공',
    snapshots: [...kept, ...snapshots],
  }

  fans.videos = {
    confidence: 'verified',
    sourceIds: [SOURCE_ID],
    collectedAt: date,
    note: '기준 영상 1개 + 구독자 상위 채널의 최신 뮤직비디오 (설정 파일에 고정)',
    items: targets.flatMap(target => {
      const item = videoById.get(target.id)
      if (!item) return []
      return [
        {
          id: target.id,
          title: item.snippet.title,
          artist: target.artist,
          kind: target.kind,
          publishedAt: item.snippet.publishedAt.slice(0, 10),
          views: item.statistics.viewCount,
          likes: item.statistics.likeCount ?? null,
          comments: item.statistics.commentCount ?? null,
        },
      ]
    }),
  }
  await writeJson(fansFile, fansDataSchema.parse(fans))

  console.log(
    `\n채널 ${snapshots.length}개, 영상 ${fans.videos.items.length}개, 댓글 원본 ${commentTotal}개 수집`
  )
  const missing = targets.filter(target => !videoById.has(target.id))
  if (missing.length > 0) {
    console.log(
      `조회되지 않은 영상: ${missing.map(target => target.id).join(', ')}`
    )
  }
  console.log(`쿼터 사용: 약 ${client.units()} units`)
  console.log(`원본: data/raw/youtube/${date}/`)
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
