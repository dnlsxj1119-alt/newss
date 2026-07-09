# 산업스터디 (뉴스 스터디 트래커 + AI 산업스터디 + AI 기사분석)

React + Vite + Supabase 기반의 산업 뉴스 스터디 기록 앱. 기존 "직접 기록" 플로우에 더해,
Claude Code 없이도 웹에서 바로 도는 두 가지 AI 도구를 추가했습니다.

- **AI 산업스터디** (`/study`, 하단 탭 ✨): News Scout → News Analyzer → Trend Connection → Critical Thinking 7단계 워크플로우. 저장 시 기존 `study_records`에 반영되어 목록/달력/완료율에 자동으로 나타납니다.
- **AI 기사분석** (`/ai-article`, 하단 탭 📄, **'다연' 계정에만 노출**): URL 또는 본문을 붙여넣어 분석 → 내 의견 → 반대 관점까지 확인하는 독립 도구. 자동 저장되지 않으며, `[산업스터디에 저장]`을 누르고 확인 모달에서 한 번 더 확인해야만 기록으로 남습니다.

두 도구 모두 Google Gemini API를 호출합니다. Gemini는 신용카드 등록 없이 무료 티어로 발급받을 수 있고, 무료 한도 안에서 Google 검색 그라운딩(실시간 웹 검색)도 함께 씁니다.

## AI 산업스터디 사용법

1. 하단 네비게이션의 **AI스터디**(✨) 또는 홈 화면의 "AI로 기사 찾아 스터디하기" 버튼으로 이동합니다.
2. **오늘 기사 찾기**: 관심 산업/키워드를 입력하고(비워두면 반도체/AI/배터리 등에서 자동 선택) 버튼을 누르면 최신 기사 3~5개가 카드로 나옵니다.
3. 카드 중 하나를 선택하고 **분석하기**를 누르면 5줄 요약 / 왜 중요한가 / 핵심 키워드 / 관련 기업 / 관련 기술이 나옵니다.
4. **지식 연결하기**를 누르면 과거에 저장한 AI 산업스터디 기록과 연결되는 지점, 밸류체인/산업 흐름, 추가로 공부하면 좋은 개념을 보여줍니다.
5. **내 의견**을 적고 **다른 관점 보기**를 누르면 반대 관점 / 놓친 요소 / 생각해볼 질문이 생성됩니다.
6. **저장하기**를 누르면 모든 결과가 Supabase의 `study_records` 테이블에 저장되고, 기존 목록/달력/완료율 화면에 그대로 반영됩니다.

## AI 기사분석 사용법 ('다연' 전용)

1. 하단 네비게이션의 **AI분석**으로 이동합니다 (다른 계정에는 이 탭이 보이지 않고, 주소로 직접 접근해도 홈으로 튕깁니다).
2. **URL 입력** 또는 **본문 직접 입력** 중 하나를 선택해 기사를 넣고 **분석하기**를 누릅니다.
   - URL에서 충분한 내용을 확인하지 못하면(로그인/유료화벽 등) 안내 배너가 뜨고, **본문 직접 입력하기**로 바로 전환할 수 있습니다.
3. 5줄 요약 / 왜 중요한가 / 핵심 키워드 / 관련 기업 / 관련 기술을 확인합니다.
4. **내 의견**을 적고 **다른 관점 보기**를 누르면 반대 관점 / 놓친 요소 / 생각해볼 질문이 나옵니다.
5. **복사하기**로 전체 결과(요약+내 의견+반대 관점 포함)를 마크다운으로 클립보드에 복사할 수 있습니다.
6. **산업스터디에 저장**은 선택 사항입니다 — 눌러도 확인 모달이 뜨고, 거기서 한 번 더 확인해야 저장됩니다. 저장 전까지는 어떤 데이터도 DB에 쓰이지 않습니다.

## 처음 실행하기 (최초 1회)

1. Supabase 대시보드 → SQL Editor에서 `supabase/ai_study_migration.sql`을 실행합니다. (기존 테이블에 nullable 컬럼만 추가하므로 기존 데이터에는 영향이 없습니다.)
2. 프로젝트 루트에 `.env` 파일을 만들고 아래 환경변수를 채웁니다. (`.env`는 `.gitignore`에 포함되어 커밋되지 않습니다.)

```
GEMINI_API_KEY=여기에_Gemini_API_키
```

   - Gemini API 키는 https://aistudio.google.com/apikey 에서 신용카드 등록 없이 무료로 발급받을 수 있습니다. (요청 속도 제한이 있지만 개인 사용량에는 충분합니다.)
   - Supabase 관련 환경변수(`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)는 기존 `.env.local`에 이미 있는 값을 그대로 사용합니다.

3. 로컬 전용 시크릿 파일 `.dev.vars`를 프로젝트 루트에 만들고 같은 값을 넣습니다 (Cloudflare Pages Functions의 로컬 개발 방식 — `.env`가 아니라 이 파일을 읽습니다):

```
GEMINI_API_KEY=여기에_Gemini_API_키
```

4. 의존성 설치 및 실행:

```
npm install
npm run dev
```

   `npm run dev`는 (1) `vite build --watch`로 프론트엔드를 계속 재빌드하고 (2) `wrangler pages dev dist`로 빌드 결과물과 `functions/` 폴더(API)를 함께 서빙합니다. **http://localhost:8788** 로 접속하세요 (Vite의 5173이 아닙니다 — API까지 포함해서 실제 배포 환경과 동일하게 도는 포트입니다).

## 배포 (Cloudflare Pages)

이 프로젝트는 **Cloudflare Pages**에 배포됩니다 (Vercel 아님). `functions/api/*.js`가 Cloudflare Pages Functions 규격(Web 표준 `Request`/`Response`, `onRequestPost`/`onRequestOptions` export)으로 작성되어 있어 별도 설정 없이 인식됩니다.

- Cloudflare Pages 프로젝트 설정 확인: Build command `npm run build`, Build output directory `dist`, Root directory는 이 저장소 루트(= `functions/`가 있는 위치)여야 합니다.
- **Settings → Environment variables**에 `GEMINI_API_KEY`를 Production/Preview 둘 다 등록하세요. (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`는 빌드 시점에 프론트엔드에 번들되므로 여기에도 등록되어 있어야 합니다.)
- `git push`하면 Cloudflare Pages가 연결된 브랜치를 자동으로 다시 빌드/배포합니다. 수동 배포가 필요하면 `npm run deploy` (`wrangler pages deploy dist`)를 사용하세요.

## 구조

```
functions/
  api/
    _lib/
      gemini.js            # fetch로 Gemini REST API 직접 호출 (Workers 런타임엔 Node SDK 사용 불가)
      handler.js             # CORS + JSON 파싱 + 에러 처리 공통 래퍼 (Request/Response 기반)
      prompts.js             # News Scout / Analyzer / Trend Connection / Critical Thinking / 기사분석 프롬프트
    news-scout.js            # /study 전용: POST { keywords } -> { articles }
    news-analyzer.js         # /study 전용: POST { title, link, press, date } -> 분석 결과
    trend-connection.js      # /study 전용: POST { article, analysis, history } -> 지식 연결 결과
    critical-thinking.js     # /study, /ai-article 공용: POST { article, analysis, opinion } -> 반대 관점/질문
    article-analyzer.js      # /ai-article 전용: POST { mode: 'url'|'text', url|content } -> 분석 결과
supabase/
  ai_study_migration.sql     # study_records 테이블 확장 SQL (최초 1회 실행, 두 도구가 공유)
src/
  lib/
    apiClient.ts             # 공용 fetch 래퍼 (postJson)
    aiStudy.ts                # /study 전용 API 클라이언트
    aiArticleAnalysis.ts      # /ai-article 전용 API 클라이언트 (critical-thinking만 재사용)
  components/ArticleCard.tsx, ConfirmModal.tsx
  pages/
    AIStudy.tsx               # 7단계 워크플로우 페이지 (/study)
    AIArticleAnalysis.tsx     # 독립 기사분석 페이지 (/ai-article, '다연' 전용)
```

## 참고 / 한계

- News Scout·News Analyzer·기사분석(URL 모드)은 Gemini의 Google 검색 그라운딩 기능으로 실제 웹 검색 결과에 근거해 기사를 찾고 분석합니다. 다만 LLM 응답이므로 가끔 부정확한 정보가 섞일 수 있어 링크를 직접 확인하는 것을 권장합니다.
- Trend Connection은 `study_records` 테이블에서 `source = 'ai_workflow'`로 저장된 과거 기록만 참고합니다. 기존 방식(직접 원문 입력)으로 작성한 기록은 연결 대상에 포함되지 않습니다.
- AI 산업스터디 / AI 기사분석으로 저장한 기록도 `raw_text`/`headlines_text`에 요약 내용을 함께 채워 넣기 때문에 기존 목록/달력/완료율 로직을 수정하지 않고도 그대로 반영됩니다.
- AI 기사분석은 저장하지 않는 한 어떤 데이터도 DB에 쓰지 않으며, `/study`와 완전히 분리되어 있어 서로 수정해도 영향이 없습니다.
- Gemini 무료 티어는 요청 속도 제한(분당/일당 횟수)이 있습니다. "Resource exhausted" 류의 에러가 나면 잠시 후 다시 시도하세요.
