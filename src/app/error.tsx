'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/layout/container'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

// 데이터 로드 실패 등 렌더링 오류 화면
// 개발 모드에서는 원인(파일명·스키마 오류)을 그대로, 프로덕션에서는 오류 코드만 노출된다
export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <Container className="py-16">
      <div
        role="alert"
        className="border-destructive/50 mx-auto max-w-2xl space-y-4 rounded-lg border p-6"
      >
        <div className="text-destructive flex items-center gap-2 font-semibold">
          <AlertTriangle className="h-5 w-5" />
          데이터를 불러오지 못했습니다
        </div>
        <pre className="bg-muted overflow-x-auto rounded-md p-4 text-xs whitespace-pre-wrap">
          {error.message}
        </pre>
        {error.digest && (
          <p className="text-muted-foreground text-xs">
            오류 코드: {error.digest}
          </p>
        )}
        <Button variant="outline" onClick={reset}>
          다시 시도
        </Button>
      </div>
    </Container>
  )
}
