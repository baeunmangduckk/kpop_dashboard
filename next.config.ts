import type { NextConfig } from 'next'

// GitHub Pages 프로젝트 페이지는 /<저장소> 아래에 놓인다.
// 배포 워크플로가 PAGES_BASE_PATH를 넣고, 로컬에서는 접두사 없이 동작한다.
const basePath = process.env.PAGES_BASE_PATH || undefined

const nextConfig: NextConfig = {
  // 서버 없이 정적 파일(out/)로 내보내기 - 응답 헤더 설정은 호스팅 쪽 몫
  output: 'export',
  basePath,
  // /metrics/finance/index.html 형태로 내보내 직접 진입·새로고침이 404가 되지 않게 함
  trailingSlash: true,
  poweredByHeader: false,
  images: {
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
}

export default nextConfig
