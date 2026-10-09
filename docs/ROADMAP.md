# K-POP 산업 인사이트 대시보드 v3 개발 로드맵

숫자의 출처와 신뢰도를 먼저 보여주고, 그 숫자들이 만드는 K-pop 산업의 이야기를 읽을 수 있는 대시보드

**📅 최종 업데이트**: 2026-10-08
**📊 진행 상황**: Phase 3 진행 중 (10/16 Tasks 완료)

## 개요

K-POP 산업 인사이트 대시보드는 산업 분석가·기획사/투자 관계자·팬덤 마케터·일반 독자를 위한 신뢰도 투명형 스토리 대시보드로 다음 기능을 제공합니다 (상세: `docs/PRD.md`):

- **3대 서사 스토리텔링 (F001)**: 최고 실적 속 둔화 / 분산과 자본 집중 / 지역 재편과 AI·버추얼
- **지표 화면 (F002~F009)**: KPI, 시장 전망, 판매 집중도, 기획사 재무, 팬 반응, 글로벌 확장, 트렌드 전망, AI·버추얼
- **신뢰도·출처 투명성 (F010, F011)**: 모든 지표에 신뢰도 배지·출처 표기, 출처 레지스트리와 알려진 불일치 공개

## 개발 워크플로우

1. **작업 계획**

- 기존 코드베이스를 학습하고 현재 상태를 파악
- 새로운 작업을 포함하도록 `ROADMAP.md` 업데이트
- 우선순위 작업은 마지막 완료된 작업 다음에 삽입

2. **작업 생성**

- `/tasks` 디렉토리에 새 작업 파일 생성 (명명 형식: `XXX-description.md`)
- 고수준 명세서, 관련 파일, 수락 기준, 구현 단계 포함
- **데이터 로직·화면 작업 시 "## 테스트 체크리스트" 섹션 필수 포함 (Playwright MCP 테스트 시나리오)**

3. **작업 구현**

- 작업 파일의 명세서를 따름
- **데이터 연동 및 비즈니스 로직 구현 시 Playwright MCP로 테스트 수행 필수**
- 각 단계 후 작업 파일 내 진행 상황 업데이트, 완료 후 중단하고 추가 지시를 기다림

4. **로드맵 업데이트**

- 원 계획서와 달라진 결정은 `docs/plan-revision-notes.md`에 Task별로 기록 (Task 016 개정 근거)

- 로드맵에서 완료된 작업을 ✅로 표시 (`/docs:update-roadmap`)

## 개발 단계

### Phase 1: 애플리케이션 골격 구축

- **Task 001: 스타터킷 템플릿 정리** ✅ - 완료
  - ✅ 메타데이터·헤더·푸터 문구를 프로젝트 명칭으로 교체
  - ✅ 홈 페이지를 플레이스홀더로 단순화 (hero·features·cta 사용 제거)
  - ✅ 헤더·모바일 내비게이션에서 로그인 링크 제거
  - ✅ README.md·CLAUDE.md 프로젝트 소개 갱신
  - ✅ 로그인·회원가입 페이지 및 폼 컴포넌트 삭제 (`src/app/login`, `src/app/signup`, `login-form.tsx`, `signup-form.tsx`)
  - ✅ `.gitattributes`로 줄바꿈 LF 통일, `npm run check-all`·`npm run build` 통과
  - ✅ 미사용 파일 삭제: `components/sections/*`, `public/*.svg`

- **Task 002: 라우트 구조 및 내비게이션 구성** ✅ - 완료
  - ✅ App Router 라우트 생성: 홈, 서사 상세(①~③ 동적 라우트), 시장 전망, 판매 집중도, 기획사 재무, 팬 반응, 글로벌 확장, 트렌드 전망, AI·버추얼, 출처·신뢰도
  - ✅ 각 페이지 빈 껍데기 + 페이지 제목·설명 메타데이터
  - ✅ 내비게이션 설정 단일 소스화(`src/lib/navigation.ts`) 후 `MainNav`·`MobileNav`가 공유
  - ✅ 데스크톱: 서사·지표 그룹 드롭다운(`navigation-menu`), 모바일: Sheet 내 그룹 목록
  - ✅ 공통 페이지 레이아웃(Header·Footer·Container) 적용
  - ✅ Playwright MCP: 데스크톱 드롭다운·360px 모바일 메뉴 이동, 정의 외 서사 경로 404 확인

- **Task 003: 데이터 타입 및 Zod 스키마 정의** ✅ - 완료
  - ✅ PRD 데이터 모델 스키마: Metric, Narrative, Insight, Source, CompanyFinancial, AlbumSales, ChannelSnapshot, TrendSeries, Discrepancy (`src/lib/schemas/`)
  - ✅ 신뢰도 라벨 enum(`verified` / `estimated` / `unverified`) 정의
  - ✅ Metric `sourceIds` 1개 이상 필수, 결측값은 `null` 허용 규칙
  - ✅ `z.infer` 기반 TypeScript 타입 export (`any` 금지)
  - ✅ 화면용 보완 필드(label·unit·asOf·method·url, 재무 confidence) PRD 반영, 스키마 통과/거부 케이스 검사

### Phase 2: 데이터·신뢰도 기반 및 공통 UI (더미 데이터)

- **Task 004: 정적 JSON 로더와 더미 데이터 구성** ✅ - 완료
  - ✅ 서버 컴포넌트용 JSON 로더(`src/lib/data/`, `public/data/*.json` 읽기 + Zod 파싱, 실패 시 파일명·필드 경로 포함 에러)
  - ✅ 캐시 정책 점검(빌드 시 정적 읽기 → 갱신 시 재빌드 필요, 개발 서버는 요청마다 반영)
  - ✅ 보고서 수치 기반 더미 JSON: metrics, insights, narratives, market, concentration, finance, fans, global, trends, ai-virtual (페이지 데이터셋 스키마 `src/lib/schemas/datasets/` 추가)
  - ✅ Playwright MCP: 잘못된 신뢰도 라벨·JSON 문법 오류 주입 시 에러 화면(`app/error.tsx`) 표시, 복구 후 정상 표시 확인

- **Task 005: 출처 레지스트리 데이터와 스키마 검증 스크립트** ✅ - 완료
  - ✅ `sources.json` 작성 (출처 37개: 지표 사용 31개 + 참고용 6개, 사용 페이지는 실제 라우트. 보고서에 원문 URL이 없어 URL은 미기재)
  - ✅ 알려진 불일치 3건 (하이브 2025 영업이익 DART 493.2억 vs 보도 499억, Gini 증감 -0.0073 vs -0.0076, Top100 총판매량 큐레이션 vs 원자료 집계)
  - ✅ 검증 스크립트(`scripts/validate-data.ts`): 전체 JSON 스키마 검사, 신뢰도 라벨 부착률·출처 연결률 100%, 미정의 sourceId·metricId·라우트, 중복 id 탐지
  - ✅ `package.json`에 `validate:data` 등록 후 `check-all`에 포함 (`tsx` 개발 의존성 추가)
  - ✅ 로더 `getSources`·`getDiscrepancies`와 출처·신뢰도 페이지 연결, 잘못된 참조 주입 시 검증 실패·Playwright 표시 확인

- **Task 006: 신뢰도·출처 공통 컴포넌트 구현** ✅ - 완료
  - ✅ `ConfidenceBadge`: verified 초록 / estimated 노랑(산출 방식 Popover — 터치 대응으로 툴팁 대신) / unverified 회색 '미검증'
  - ✅ `SourceCitation`: 출처·기준일 표시, 클릭 시 출처·신뢰도 페이지 해당 행(`/sources#source-{id}`)으로 이동
  - ✅ `NarrativeSection`: 서사 문단 + 인라인 차트 슬롯 + 근거 지표 링크 묶음 (지표→페이지 매핑 `getMetricHrefMap`)
  - ✅ `KpiCard`, 안내 배지 `NoticeBadge`(프록시·결측·상대지수·표본·더미)
  - ✅ 라이트/다크 모드 대비 확인 (신뢰도 색상 토큰, 배지 대비 6.8:1 이상), 360px 가로 스크롤 없음
  - ✅ 개발 전용 쇼케이스 `/dev/components` (프로덕션 404), 검증 스크립트에 지표 페이지 미연결·출처 pages 불일치 탐지 추가

- **Task 007: 차트 공통 래퍼와 색상 팔레트 확정** ✅ - 완료
  - ✅ Recharts 3 기반 시계열·막대·분포 차트 래퍼 (shadcn Chart 적용 — Recharts 3.10과 호환 확인) + 공통 외곽 `ChartFrame`
  - ✅ 접근성 고려 색상 팔레트 확정: 범주형 8색 고정 순서(라이트·다크 각각 검증 스크립트 PASS), 파랑 순차 ramp
  - ✅ 결측 구간 끊김 표기(+결측 안내 배지), 연도는 연속 축, 모바일 축 숫자 축약(억·만)·눈금 자동 생략·범례 줄바꿈
  - ✅ 차트 하단 신뢰도 배지·출처 슬롯, "표로 보기"(색 대비 3:1 미만 계열 보완·대체 텍스트)

### Phase 3: 화면 구현 (서사 우선)

- **Task 008: 홈(스토리) 페이지 구현** ✅ - 완료
  - ✅ KPI 카드 6종(값·전기 대비·추세·배지), 지표명 → 해당 지표 페이지
  - ✅ 서사 요약 카드 3종(핵심 메시지·근거 지표 수·신뢰도 구성) → 카드 전체가 서사 상세 링크
  - ✅ 수동/자동 인사이트 목록(주의·참고·긍정 아이콘+라벨, 근거 지표 링크), 신뢰도 분포 요약 → 출처·신뢰도 페이지
  - ✅ Playwright MCP: KPI·서사 카드 클릭 이동, 360px 가로 스크롤 없음

- **Task 009: 서사 상세 ①~③ 페이지 구현** ✅ - 완료
  - ✅ 서사별 스크롤 스토리 (NarrativeSection + 문단별 인라인 차트 6종, 차트는 지표 페이지와 공유하는 `metric-charts` 컴포넌트)
  - ✅ 근거 지표 링크 → 지표 페이지 이동, 이전/다음 서사 이동
  - ✅ Playwright MCP: 홈 → 서사 → 근거 지표 → 출처(`/sources#source-…`) 여정, 360px 가로 스크롤 없음

- **Task 010: 시장·집중도·재무 지표 페이지 구현** ✅ - 완료
  - ✅ 시장 전망: 핵심 지표 9종, 수출액 시계열(2024 결측 끊김)·전년 대비 증가율, 조사기관별 공연 시장 전망 비교 표
  - ✅ 판매 집중도: 점유율·Gini 추이, 1위 vs 100위 격차 배수, Top100 총 판매량, 대기업 vs 중소 격차 표, 생존율·판매 티어, 지속가능성 신호 6건
  - ✅ 기획사 재무: 회사·연도 필터(Zustand, 마지막 항목 숨김 방지·전체 보기), 매출·영업이익·이익률 차트, 실적 요약(흑자/적자 전환 표시), 하이브 영업이익 불일치 안내, 대형 vs 중소 분기 매출
  - ✅ Playwright MCP: 회사·연도 필터 동작, 3개 페이지 360px 가로 스크롤 없음

- **Task 011: 팬 반응·글로벌·AI·버추얼·출처 페이지 구현** - 우선순위
  - 팬 반응: 반응 지표, 감성 분포(표본 수·수집일), 순위 표
  - 글로벌 확장: 지역별 변화(프록시 안내), 신흥시장·유망 권역
  - AI·버추얼: 시장 전망 경로, 팬덤 플랫폼 지표, 사례 카드
  - 출처·신뢰도: 레지스트리 표·필터, 신뢰도 분포, 불일치 목록
  - Playwright MCP: 배지 클릭 → 출처 페이지 이동 테스트

- **Task 012: 반응형 점검 및 전체 플로우 통합 테스트**
  - 주요 화면 360px 이상 가로 스크롤 없음 확인
  - Playwright MCP: 전체 사용자 여정 E2E, 모바일/데스크톱 뷰포트
  - 빈 데이터·결측·로더 에러 엣지 케이스 확인

### Phase 4: 신규 데이터 연동

- **Task 013: OpenDART·YouTube 데이터 수집 연동**
  - API 키는 서버 전용 `.env.local` 보관 (`src/lib/env.ts` 스키마 추가), 수집 스크립트에서만 호출
  - OpenDART: 상장 4사 + 중소 상장사(FNC·큐브·RBW·TN엔터) 연결 재무 → finance.json
  - YouTube: video_id 설정 파일 기반 표본 확대, 구독자·조회수 스냅샷 누적
  - 신규 지표 신뢰도 표기(재무·수치 verified, 감성 estimated)
  - Playwright MCP: 갱신 데이터 화면 반영 확인

- **Task 014: Circle Chart·Google Trends 데이터 적재와 트렌드 화면**
  - Circle Chart: 약관 확인 → Playwright 수동 수집(저빈도) → 원본 스냅샷 보존 → Zod 검증 → 큐레이션 값과 대조
  - Google Trends: 키워드 목록 확정, CSV 수동 다운로드 → JSON 적재 (공식 API 알파 신청 병행)
  - 트렌드 전망 페이지: 키워드 시계열, 급상승 쿼리, 국가별 관심도 지도, 상대지수 안내
  - 글로벌 확장 페이지 국가별 관심도 연결
  - Playwright MCP: 키워드 필터·지도 렌더링 테스트

### Phase 5: 품질·검증

- **Task 015: 미검증 지표 승격 및 접근성·성능 점검**
  - unverified 지표 원문 재확인 → verified/estimated 승격, 신뢰도 분포 갱신
  - 접근성 점검(색 대비, 키보드 내비게이션, 차트 대체 텍스트)
  - 성능 점검(번들 크기, 이미지·폰트 최적화)
  - `npm run check-all`·`npm run build` 최종 통과
  - 출처 URL 보강 (보고서에 원문 링크가 없어 Task 005에서 미기재)

- **Task 016: 신규 계획서 개정**
  - 입력: `docs/plan-revision-notes.md`(Task별 변경 누적 기록), 최종 PRD·ROADMAP, 검증 결과(라벨 부착률·출처 연결률·승격 현황)
  - 원 계획서(`pm/K-POP_대시보드_신규_계획서.docx`) 대비 추가·변경·보류·한계 반영
  - 개정판 계획서 작성 (형식은 작성 시점에 확정, 기본은 기존과 동일한 docx)
