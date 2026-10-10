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

홈(스토리), 서사 상세 ①~③, 시장 전망, 판매 집중도, 기획사 재무, 팬 반응, 글로벌 확장, AI·버추얼, 출처·신뢰도

## 기술 스택

- Next.js 15.5.3 (App Router + Turbopack), React 19, TypeScript 5
- TailwindCSS v4, shadcn/ui (new-york), Radix UI, Lucide
- Recharts, Zustand, Zod
- 데이터: `public/data/*.json` 정적 산출물 (OpenDART, YouTube Data API, Circle Chart 등에서 수집)

## 실행

```bash
npm install
npm run dev        # 개발 서버
npm run check-all  # 타입·린트·포맷 검사
npm run build      # 프로덕션 빌드
```

## 데이터 갱신

API 키는 `.env.local`(`DART_API_KEY`, `YOUTUBE_API_KEY`)에 두며 수집 스크립트에서만 읽습니다.

| 명령                          | 내용                                                                                 | 갱신 파일                                                |
| ----------------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------- |
| `npm run collect:dart`        | OpenDART 사업보고서 주요계정 (대상: `data/config/dart-companies.json`)               | `finance.json`, `metrics.json`                           |
| `npm run collect:youtube`     | 채널·영상 통계, 댓글 원본은 로컬에만 보관 (대상: `data/config/youtube-targets.json`) | `fans.json`                                              |
| `npm run collect:circlechart` | Circle Chart 연간 앨범 차트 Top100 (연도 지정 가능: `-- 2025`)                       | `album-sales.json`, `concentration.json`, `metrics.json` |

- 응답 원본은 `data/raw/{출처}/{수집일}/`에 보존합니다.
- 수집 후 `npm run validate:data`로 검증하고 다시 빌드해야 화면에 반영됩니다.

### 댓글 감성 분석 (파이썬)

댓글 원본은 저장소에 없으므로 먼저 `npm run collect:youtube`로 로컬에 받아야 합니다.

```bash
python -m venv .venv
.venv/Scripts/python -m pip install -r scripts/analyze/requirements.txt   # 최초 1회 (모델 약 1.1GB 별도 다운로드)
.venv/Scripts/python scripts/analyze/sentiment.py                          # 분류 → data/derived/youtube-sentiment.json (개수만)
npm run apply:sentiment                                                    # fans.json 반영
```

- 모델: `cardiffnlp/twitter-xlm-roberta-base-sentiment-multilingual` (다국어 긍정·중립·부정 3분류)
- 사람이 직접 읽고 매긴 라벨과의 비교 결과는 `data/derived/youtube-sentiment-review.json`에 기록합니다.

## 배포 (GitHub Pages)

서버 없이 정적 파일로 내보내 GitHub Pages에 올립니다(`next.config.ts`의 `output: 'export'`).

1. 저장소 Settings → Pages → Source를 **GitHub Actions**로 설정합니다.
2. `main`에 push하면 `.github/workflows/deploy.yml`이 검사(`check-all`) → 빌드 → 배포를 실행합니다.
3. 주소는 `https://<계정>.github.io/<저장소>/`입니다. 경로 접두사는 워크플로가 `PAGES_BASE_PATH`로 넣습니다.

- 데이터 갱신: 로컬에서 수집 → `npm run validate:data` → 커밋·push하면 자동으로 다시 배포됩니다. 배포 과정에는 API 키가 필요 없습니다.
- 로컬에서 내보내기 확인: `npm run build` 후 `out/` 폴더.
- 제한: GitHub Pages는 사용자 지정 응답 헤더(X-Frame-Options 등)를 지원하지 않습니다.
- 유튜브 댓글 원본(`data/raw/youtube/*/comments/`)은 저장소에 올리지 않고 로컬에만 둡니다.

## 문서

- 요구사항: [`docs/PRD.md`](docs/PRD.md)
- 개발 로드맵: [`docs/ROADMAP.md`](docs/ROADMAP.md)
- 기획 원문: `pm/` 폴더
