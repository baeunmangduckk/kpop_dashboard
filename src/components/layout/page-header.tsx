import { Container } from './container'

interface PageHeaderProps {
  title: string
  description?: string
  eyebrow?: string
}

export function PageHeader({ title, description, eyebrow }: PageHeaderProps) {
  return (
    <Container className="pt-10 pb-6 sm:pt-12">
      {eyebrow && (
        <p className="text-primary mb-2 text-sm font-medium">{eyebrow}</p>
      )}
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
      {description && (
        <p className="text-muted-foreground mt-2 max-w-3xl">{description}</p>
      )}
    </Container>
  )
}
