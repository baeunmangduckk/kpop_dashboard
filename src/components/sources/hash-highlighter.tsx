'use client'

import { useEffect } from 'react'

const ATTR = 'data-hash-target'

// 클라이언트 내비게이션(pushState)에서는 CSS :target이 동작하지 않아,
// URL 해시가 가리키는 요소에 data-hash-target을 붙여 강조하고 화면 안으로 스크롤
export function HashHighlighter() {
  useEffect(() => {
    const apply = () => {
      document
        .querySelectorAll(`[${ATTR}]`)
        .forEach(el => el.removeAttribute(ATTR))
      const id = decodeURIComponent(window.location.hash.slice(1))
      if (!id) return
      const target = document.getElementById(id)
      if (!target) return
      target.setAttribute(ATTR, '')
      target.scrollIntoView({ block: 'start' })
    }
    apply()
    window.addEventListener('hashchange', apply)
    return () => window.removeEventListener('hashchange', apply)
  }, [])

  return null
}
