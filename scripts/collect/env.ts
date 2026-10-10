import { z } from 'zod'

// 수집 스크립트 전용 환경 변수 (.env.local, 앱 번들에는 노출하지 않음)
const envSchema = z.object({
  DART_API_KEY: z.string().min(1),
  YOUTUBE_API_KEY: z.string().min(1),
})

type CollectEnv = z.infer<typeof envSchema>

// 필요한 키만 검증해 반환, 없으면 어떤 키가 없는지 알리고 종료
export function requireEnv<K extends keyof CollectEnv>(
  ...keys: K[]
): Pick<CollectEnv, K> {
  const missing = keys.filter(
    key => !envSchema.shape[key].safeParse(process.env[key]?.trim()).success
  )
  if (missing.length > 0) {
    console.error(
      `환경 변수가 없습니다: ${missing.join(', ')}\n.env.local에 값을 넣은 뒤 다시 실행하세요.`
    )
    process.exit(1)
  }
  return Object.fromEntries(
    keys.map(key => [key, process.env[key]!.trim()])
  ) as Pick<CollectEnv, K>
}
