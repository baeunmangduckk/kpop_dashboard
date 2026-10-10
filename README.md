# K-POP 산업 인사이트 대시보드 v3

숫자의 출처와 신뢰도를 먼저 보여주고, 그 숫자들이 만드는 K-pop 산업의 이야기를 읽을 수 있는 대시보드입니다.

## 개요

- **목적**: 공시·API 실측 값과 2차 보도·리서치 추정치가 섞인 K-pop 산업 지표를 신뢰도 라벨과 출처와 함께 공개하고, 3대 서사로 묶어 산업 흐름을 설명
- **대상**: 산업 분석가, 기획사·투자 관계자, 팬덤·콘텐츠 마케터, 일반 독자 (로그인 없이 공개 열람)

### 3대 서사

1. 최고 실적 속 둔화 신호
2. 판매 분산과 자본 집중의 이중 구조
3. 지역 재편과 AI·버추얼

### 주요 화면

홈(스토리), 서사 상세 ①~③, 시장 전망, 판매 집중도, 기획사 재무, 팬 반응, 글로벌 확장, 트렌드 전망, AI·버추얼, 출처·신뢰도

## 기술 스택

- Next.js 15.5.3 (App Router + Turbopack), React 19, TypeScript 5
- TailwindCSS v4, shadcn/ui (new-york), Radix UI, Lucide
- Recharts, Zustand, Zod
- 데이터: `public/data/*.json` 정적 산출물 (OpenDART, YouTube Data API, Google Trends, Circle Chart 등에서 수집)

## 실행

```bash
npm install
npm run dev        # 개발 서버
npm run check-all  # 타입·린트·포맷 검사
npm run build      # 프로덕션 빌드
```

## 데이터 갱신

API 키는 `.env.local`(`DART_API_KEY`, `YOUTUBE_API_KEY`)에 두며 수집 스크립트에서만 읽습니다.

| 명령                      | 내용                                                                   | 갱신 파일                      |
| ------------------------- | ---------------------------------------------------------------------- | ------------------------------ |
| `npm run collect:dart`    | OpenDART 사업보고서 주요계정 (대상: `data/config/dart-companies.json`) | `finance.json`, `metrics.json` |
| `npm run collect:youtube` | 채널·영상 통계, 댓글 원본 (대상: `data/config/youtube-targets.json`)   | `fans.json`                    |

- 응답 원본은 `data/raw/{출처}/{수집일}/`에 보존합니다.
- 수집 후 `npm run validate:data`로 검증하고 다시 빌드해야 화면에 반영됩니다.

## 문서

- 요구사항: [`docs/PRD.md`](docs/PRD.md)
- 개발 로드맵: [`docs/ROADMAP.md`](docs/ROADMAP.md)
- 기획 원문: `pm/` 폴더
