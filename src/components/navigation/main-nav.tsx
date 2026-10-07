'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import {
  isActivePath,
  isNavGroup,
  mainNavigation,
  type NavGroup,
} from '@/lib/navigation'
import { cn } from '@/lib/utils'

// 데스크톱 헤더 메뉴 - 서사·지표는 드롭다운 그룹으로 표시
export function MainNav() {
  const pathname = usePathname()

  const isGroupActive = (group: NavGroup) =>
    group.items.some(item => isActivePath(pathname, item.href))

  return (
    <NavigationMenu>
      <NavigationMenuList>
        {mainNavigation.map(entry =>
          isNavGroup(entry) ? (
            <NavigationMenuItem key={entry.title}>
              <NavigationMenuTrigger
                className={cn(isGroupActive(entry) && 'text-primary')}
              >
                {entry.title}
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[480px] gap-1 p-2 lg:w-[560px] lg:grid-cols-2">
                  {entry.items.map(item => (
                    <li key={item.href}>
                      <NavigationMenuLink
                        asChild
                        active={isActivePath(pathname, item.href)}
                      >
                        <Link href={item.href}>
                          <span className="text-sm font-medium">
                            {item.title}
                          </span>
                          <span className="text-muted-foreground line-clamp-2 text-xs">
                            {item.description}
                          </span>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          ) : (
            <NavigationMenuItem key={entry.href}>
              <NavigationMenuLink
                asChild
                active={isActivePath(pathname, entry.href)}
                className={cn(
                  navigationMenuTriggerStyle(),
                  isActivePath(pathname, entry.href) && 'text-primary'
                )}
              >
                <Link href={entry.href}>{entry.title}</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          )
        )}
      </NavigationMenuList>
    </NavigationMenu>
  )
}
