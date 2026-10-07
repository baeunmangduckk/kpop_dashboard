'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Separator } from '@/components/ui/separator'
import { SheetDescription, SheetTitle } from '@/components/ui/sheet'
import {
  isActivePath,
  isNavGroup,
  mainNavigation,
  type NavLink,
} from '@/lib/navigation'
import { cn } from '@/lib/utils'

interface MobileNavProps {
  onClose: () => void
}

// 모바일 Sheet 메뉴 - 그룹 제목 아래 하위 링크를 펼쳐서 표시
export function MobileNav({ onClose }: MobileNavProps) {
  const pathname = usePathname()

  const renderLink = (item: NavLink) => (
    <Link
      key={item.href}
      href={item.href}
      onClick={onClose}
      aria-current={isActivePath(pathname, item.href) ? 'page' : undefined}
      className={cn(
        'hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground block rounded-md px-2 py-2 text-sm font-medium transition-colors outline-none',
        isActivePath(pathname, item.href) && 'bg-accent text-accent-foreground'
      )}
    >
      {item.title}
    </Link>
  )

  return (
    <nav className="flex flex-col overflow-y-auto px-4 pt-6 pb-8">
      <SheetTitle className="mb-2 px-2 text-lg">메뉴</SheetTitle>
      <SheetDescription className="sr-only">
        대시보드 페이지 이동 메뉴
      </SheetDescription>
      <Separator className="mb-4" />
      <div className="space-y-4">
        {mainNavigation.map(entry =>
          isNavGroup(entry) ? (
            <div key={entry.title}>
              <p className="text-muted-foreground mb-1 px-2 text-xs font-semibold">
                {entry.title}
              </p>
              <div className="space-y-1">{entry.items.map(renderLink)}</div>
            </div>
          ) : (
            renderLink(entry)
          )
        )}
      </div>
    </nav>
  )
}
