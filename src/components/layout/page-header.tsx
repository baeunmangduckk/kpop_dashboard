import { cn } from '@/lib/utils'
import { Container } from './container'

interface PageHeaderProps {
  title: string
  description?: string
  eyebrow?: string
  // 읽기 폭(3xl) 본문을 가운데에 두는 화면에서 제목도 같은 세로선에 맞춤
  narrow?: boolean
}

export function PageHeader({
  title,
  description,
  eyebrow,
  narrow = false,
}: PageHeaderProps) {
  return (
    <Container className="pt-10 pb-6 sm:pt-12">
      <div className={cn(narrow && 'mx-auto max-w-3xl')}>
        {eyebrow && (
          <p className="text-primary mb-2 text-sm font-medium">{eyebrow}</p>
        )}
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="text-muted-foreground mt-2 max-w-3xl">{description}</p>
        )}
      </div>
    </Container>
  )
}
