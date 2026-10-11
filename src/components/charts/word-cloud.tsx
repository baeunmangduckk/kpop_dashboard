'use client'

import cloud from 'd3-cloud'
import { useEffect, useRef, useState } from 'react'

export interface CloudWord {
  text: string
  // 크기를 정하는 값 (댓글 수 등)
  value: number
  color: string
  // 마우스를 올렸을 때 보여 줄 설명
  detail: string
}

interface PlacedWord extends CloudWord {
  x: number
  y: number
  size: number
}

interface Hover {
  word: PlacedWord
  left: number
  top: number
}

const NARROW = 480
const PADDING = 4

// 새로고침해도 같은 배치가 나오도록 고정 시드 난수 사용 (mulberry32)
function seededRandom(seed: number) {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// 값이 큰 단어일수록 크게 - 면적이 값에 비례하도록 제곱근 축척
function fontSizer(words: CloudWord[], min: number, max: number) {
  const values = words.map(word => Math.sqrt(word.value))
  const low = Math.min(...values)
  const high = Math.max(...values)
  return (value: number) =>
    high === low
      ? (min + max) / 2
      : min + ((Math.sqrt(value) - low) / (high - low)) * (max - min)
}

// 단어를 겹치지 않게 채워 넣은 워드 클라우드 (배치 계산은 d3-cloud, 그리기는 SVG)
export function WordCloud({ words }: { words: CloudWord[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  const [placed, setPlaced] = useState<PlacedWord[]>([])
  const [hover, setHover] = useState<Hover | null>(null)

  const narrow = width < NARROW
  const height = narrow ? 300 : 340

  useEffect(() => {
    const element = containerRef.current
    if (!element) return
    const observer = new ResizeObserver(entries => {
      const next = Math.floor(entries[0].contentRect.width)
      setWidth(current => (current === next ? current : next))
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (width === 0) return
    // 좁은 화면에서는 단어 수와 글자 크기를 줄여 넘치지 않게 함
    const visible = [...words]
      .sort((a, b) => b.value - a.value)
      .slice(0, narrow ? 36 : 60)
    const sizeOf = fontSizer(visible, narrow ? 12 : 14, narrow ? 32 : 60)
    const fontFamily = getComputedStyle(document.body).fontFamily

    const layout = cloud<PlacedWord & cloud.Word>()
      .size([width, height])
      .words(
        visible.map(word => ({ ...word, x: 0, y: 0, size: sizeOf(word.value) }))
      )
      .padding(PADDING)
      .rotate(0)
      .font(fontFamily)
      .fontWeight(600)
      .fontSize(word => word.size)
      .random(seededRandom(20261010))
      .on('end', result => {
        setPlaced(
          result.map(word => ({
            text: word.text,
            value: word.value,
            color: word.color,
            detail: word.detail,
            x: word.x,
            y: word.y,
            size: word.size,
          }))
        )
      })
    layout.start()
    return () => {
      layout.stop()
    }
  }, [words, width, height, narrow])

  return (
    <div ref={containerRef} className="relative w-full" style={{ height }}>
      {width > 0 && (
        <svg width={width} height={height} role="presentation">
          <g transform={`translate(${width / 2},${height / 2})`}>
            {placed.map(word => (
              <text
                key={word.text}
                textAnchor="middle"
                transform={`translate(${word.x},${word.y})`}
                fontSize={word.size}
                fontWeight={600}
                fill={word.color}
                className="cursor-default transition-opacity"
                opacity={hover && hover.word.text !== word.text ? 0.45 : 1}
                onMouseEnter={() =>
                  setHover({
                    word,
                    left: width / 2 + word.x,
                    top: height / 2 + word.y - word.size,
                  })
                }
                onMouseLeave={() => setHover(null)}
              >
                {word.text}
              </text>
            ))}
          </g>
        </svg>
      )}
      {hover && (
        <div
          className="border-border/50 bg-background pointer-events-none absolute z-10 w-max max-w-[16rem] -translate-x-1/2 -translate-y-full rounded-lg border px-2.5 py-1.5 text-xs shadow-xl"
          style={{
            // 툴팁이 좌우로 넘치지 않게 가운데 기준 위치를 안쪽으로 제한
            left: Math.min(Math.max(hover.left, 90), Math.max(width - 90, 90)),
            top: Math.max(hover.top, 36),
          }}
        >
          <p className="font-medium">{hover.word.text}</p>
          <p className="text-muted-foreground tabular-nums">
            {hover.word.detail}
          </p>
        </div>
      )}
    </div>
  )
}
