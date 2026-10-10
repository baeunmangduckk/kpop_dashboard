// 내비게이션·라우트 단일 소스 - 헤더 메뉴, 모바일 메뉴, 페이지 메타데이터가 함께 사용

import type { NarrativeSlug } from '@/lib/schemas'

export interface NavLink {
  title: string
  href: string
  description: string
}

export interface NavGroup {
  title: string
  items: NavLink[]
}

export type NavEntry = NavLink | NavGroup

export interface Narrative {
  slug: NarrativeSlug
  order: number
  title: string
  description: string
}

// 3대 서사 (PRD F001)
export const narratives: Narrative[] = [
  {
    slug: 'slowdown',
    order: 1,
    title: '최고 실적 속 둔화 신호',
    description:
      '매출은 최고치이나 이익률 급락, 음반 수출 증가율 둔화, 실물앨범 첫 역성장이 함께 나타난다.',
  },
  {
    slug: 'polarization',
    order: 2,
    title: '분산과 자본 집중의 이중 구조',
    description:
      '판매는 분산되지만 제작비·투어·매출 격차는 극단적인 양극화가 이어진다.',
  },
  {
    slug: 'realignment',
    order: 3,
    title: '지역 재편과 AI·버추얼',
    description:
      '중화권·일본이 줄고 북미·신흥시장이 부상하며, 버추얼 아이돌은 초기 단계에 있다.',
  },
]

export function getNarrative(slug: string): Narrative | undefined {
  return narratives.find(narrative => narrative.slug === slug)
}

// 서사 순서 표기 (①②③)
const ORDER_MARKS = ['①', '②', '③']

export function getNarrativeMark(order: number): string {
  return ORDER_MARKS[order - 1] ?? String(order)
}

export function getNarrativeHref(slug: string): string {
  return `/narratives/${slug}`
}

// 지표 페이지 (PRD F003~F009)
export const metricPages: NavLink[] = [
  {
    title: '시장 전망',
    href: '/metrics/market',
    description: '시장 규모·수출·공연 시장 전망',
  },
  {
    title: '판매 집중도',
    href: '/metrics/concentration',
    description: '판매 분산과 자본·인프라 격차',
  },
  {
    title: '기획사 재무',
    href: '/metrics/finance',
    description: '상장 기획사 실적·수익성 비교 (DART)',
  },
  {
    title: '팬 반응',
    href: '/metrics/fans',
    description: '채널·영상 반응과 팬덤 규모',
  },
  {
    title: '글로벌 확장',
    href: '/metrics/global',
    description: '중화권·일본 축소와 북미·신흥시장 부상',
  },
  {
    title: 'AI·버추얼',
    href: '/metrics/ai-virtual',
    description: '버추얼·AI 아이돌 초기 시장 추적',
  },
]

export const homeLink: NavLink = {
  title: '홈',
  href: '/',
  description: '3대 서사와 핵심 KPI 요약',
}

export const sourcesLink: NavLink = {
  title: '출처·신뢰도',
  href: '/sources',
  description: '출처 레지스트리와 검증 상태',
}

export const mainNavigation: NavEntry[] = [
  homeLink,
  {
    title: '서사',
    items: narratives.map(narrative => ({
      title: `${narrative.order}. ${narrative.title}`,
      href: getNarrativeHref(narrative.slug),
      description: narrative.description,
    })),
  },
  { title: '지표', items: metricPages },
  sourcesLink,
]

export function getMetricPage(href: string): NavLink {
  const page = metricPages.find(item => item.href === href)
  if (!page) {
    throw new Error(`정의되지 않은 지표 페이지입니다: ${href}`)
  }
  return page
}

// 라우트 경로 → 화면 이름 (출처 레지스트리의 사용 페이지 표시용)
export function getRouteTitle(href: string): string {
  if (href === homeLink.href) return homeLink.title
  if (href === sourcesLink.href) return sourcesLink.title
  const narrative = narratives.find(
    item => getNarrativeHref(item.slug) === href
  )
  if (narrative) return `서사 ${getNarrativeMark(narrative.order)}`
  return metricPages.find(item => item.href === href)?.title ?? href
}

export function isNavGroup(entry: NavEntry): entry is NavGroup {
  return 'items' in entry
}

// 홈은 정확히 일치할 때만, 나머지는 하위 경로까지 활성 처리
export function isActivePath(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}
