# PageCraft - 설정 가이드

## 개요

PageCraft는 AI 기반 랜딩페이지 생성 SaaS입니다. 사용자가 제품을 설명하면 AI가 완성된 반응형 랜딩페이지를 자동 생성합니다.

## 기술 스택

- **프레임워크**: Next.js 15 (App Router)
- **스타일링**: Tailwind CSS v4
- **인증 & DB**: Supabase (프로덕션) / SQLite (로컬 개발)
- **결제**: Stripe
- **AI**: Claude API (Anthropic)
- **배포**: Vercel

---

## 1. 빠른 시작 (로컬 개발)

외부 서비스 없이 바로 실행할 수 있습니다.

```bash
npm install
npm run dev
```

`http://localhost:3000` 접속.

`.env.local`에 `USE_LOCAL_DB=true`가 기본 설정되어 있어서:
- **Supabase 불필요** — SQLite 파일 DB (`local.db`)가 자동 생성됨
- **로그인 불필요** — 로컬 개발자 계정이 자동 인증됨 (Team 플랜)
- **AI 페이지 생성**만 Anthropic API 키 필요 (없으면 해당 기능만 비활성)

---

## 2. 프로덕션 설정

### 사전 요구사항

- Node.js 18+
- npm
- Supabase 계정 (무료 플랜 가능)
- Stripe 계정 (테스트 모드)
- Anthropic API 키

---

### 2.1 Supabase 설정

#### 프로젝트 생성

1. [supabase.com](https://supabase.com)에서 새 프로젝트 생성
2. **Project URL**과 **Anon Key** 확인 (Settings → API)

#### 마이그레이션 실행

1. Supabase 대시보드 → **SQL Editor** 이동
2. 아래 파일들을 순서대로 복사 후 실행:
   - `supabase/migrations/001_init.sql`
   - `supabase/migrations/002_ab_testing.sql`
   - `supabase/migrations/003_api_keys_teams_brandkit.sql`
   - `supabase/migrations/004_multi_page.sql`
   - `supabase/migrations/005_integrations.sql`
   - `supabase/migrations/006_rpc_functions.sql`

생성되는 항목:
- `profiles` 테이블 (auth.users 연동)
- `projects` 테이블 (랜딩페이지 저장)
- `variants`, `submissions`, `referrals` 테이블 (A/B 테스트, 리드 수집, 추천)
- `api_keys`, `teams`, `team_members` 테이블 (API, 팀)
- `brand_kits`, `page_events`, `pages`, `integrations` 테이블
- RLS 보안 정책
- 자동 프로필 생성 트리거
- 월별 페이지 수 초기화 함수

#### 인증 프로바이더 설정

1. **Authentication → Providers** 이동
2. **Email** 활성화 (기본 활성)
3. (선택) **Google OAuth** 활성화:
   - Google Cloud Console에서 OAuth 자격 증명 생성
   - Client ID와 Secret을 Supabase에 입력
   - 리다이렉트 URL 설정: `https://도메인/callback`

#### 월별 초기화 설정 (선택)

무료 유저 페이지 생성 횟수를 매월 초기화하려면:
1. **Database → Extensions** → `pg_cron` 활성화
2. SQL Editor에서 실행:
```sql
select cron.schedule(
  'reset-monthly-pages',
  '0 0 1 * *',
  $$select public.reset_monthly_page_count()$$
);
```

---

### 2.2 Stripe 설정

#### 상품 생성

1. [Stripe Dashboard](https://dashboard.stripe.com) → Products 이동
2. **Pro** 상품 생성:
   - 가격: $19/월 (반복 결제)
   - Price ID 메모 (`price_xxx`)
3. **Team** 상품 생성:
   - 가격: $49/월 (반복 결제)
   - Price ID 메모 (`price_xxx`)

#### 웹훅 설정

1. **Developers → Webhooks** 이동
2. 엔드포인트 추가: `https://도메인/api/webhooks/stripe`
3. 이벤트 선택:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Webhook Secret 메모 (`whsec_xxx`)

#### 로컬 개발 시 웹훅 테스트

```bash
# Stripe CLI 설치
brew install stripe/stripe-cli/stripe

# 로그인
stripe login

# 로컬로 웹훅 포워딩
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

### 2.3 Anthropic API

1. [console.anthropic.com](https://console.anthropic.com) 접속
2. API 키 생성
3. 크레딧 충전 (페이지 생성당 약 $0.01-0.05)

---

### 2.4 환경 변수

`.env.example`을 `.env.local`로 복사 후 값 입력:

```bash
cp .env.example .env.local
```

프로덕션에서는 `USE_LOCAL_DB`를 삭제하거나 `false`로 설정.

| 변수 | 확인 위치 |
|------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API |
| `STRIPE_SECRET_KEY` | Stripe → Developers → API Keys |
| `STRIPE_WEBHOOK_SECRET` | Stripe → Developers → Webhooks |
| `STRIPE_PRO_PRICE_ID` | Stripe → Products → Pro → Price ID |
| `STRIPE_TEAM_PRICE_ID` | Stripe → Products → Team → Price ID |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe → Developers → API Keys |
| `ANTHROPIC_API_KEY` | Anthropic Console → API Keys |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` (개발) 또는 도메인 |

---

## 3. Vercel 배포

1. GitHub에 코드 push
2. [Vercel](https://vercel.com)에서 import
3. `.env.local`의 모든 환경 변수 추가
4. 배포

### 커스텀 도메인

1. Vercel → Settings → Domains에서 도메인 추가
2. `NEXT_PUBLIC_APP_URL` 환경 변수 업데이트
3. Supabase 리다이렉트 URL 업데이트
4. Stripe 웹훅 URL 업데이트

---

## 4. 프로젝트 구조

```
pagecraft/
├── src/
│   ├── app/
│   │   ├── (auth)/              # 로그인, 회원가입, OAuth 콜백
│   │   ├── (app)/               # 대시보드, 에디터, 설정 (인증 필요)
│   │   │   ├── dashboard/       # 프로젝트 관리, 분석, 리드, 추천
│   │   │   ├── editor/[id]/     # 페이지 에디터 (미리보기/코드/AI 채팅)
│   │   │   └── settings/        # 프로필, 결제, 브랜드킷
│   │   ├── (marketing)/         # 템플릿 갤러리
│   │   ├── api/                 # API 라우트
│   │   │   ├── generate/        # AI 페이지 생성
│   │   │   ├── billing/         # Stripe 체크아웃/포탈
│   │   │   ├── webhooks/stripe/ # Stripe 웹훅 처리
│   │   │   ├── v1/generate/     # 공개 REST API (Team 플랜)
│   │   │   ├── chat-edit/       # AI 채팅 에디터
│   │   │   ├── regenerate-section/ # AI 섹션 재생성
│   │   │   └── ...              # 기타 API (도메인, 팀, 분석 등)
│   │   ├── p/[slug]/            # 퍼블리시된 페이지 (공개)
│   │   ├── layout.tsx           # 루트 레이아웃
│   │   └── page.tsx             # 마케팅 랜딩페이지
│   ├── components/
│   │   ├── app/                 # 앱 전용 컴포넌트 (섹션 에디터, 채팅 등)
│   │   └── ui/                  # 재사용 UI 컴포넌트
│   ├── lib/
│   │   ├── supabase/            # Supabase 클라이언트 (브라우저/서버/미들웨어)
│   │   ├── local-db/            # 로컬 SQLite 어댑터
│   │   ├── ai.ts                # Claude API 연동
│   │   ├── stripe.ts            # Stripe 설정 & 플랜
│   │   ├── analytics.ts         # PostHog 분석
│   │   ├── api-auth.ts          # API 키 인증
│   │   ├── templates.ts         # 템플릿 데이터
│   │   ├── languages.ts         # 다국어 지원
│   │   ├── integrations.ts      # 서드파티 연동 설정
│   │   └── utils.ts             # 유틸리티 함수
│   ├── types/                   # TypeScript 타입 정의
│   └── middleware.ts            # 인증 미들웨어
├── supabase/
│   └── migrations/              # DB 마이그레이션 SQL (6개)
├── docs/
│   ├── SETUP.md                 # 이 파일
│   └── ROADMAP.md               # 제품 로드맵
└── .env.example                 # 환경 변수 템플릿
```

---

## 5. 수익 모델

| 플랜 | 가격 | 제한 |
|------|------|------|
| Free | $0 | 월 1페이지, PageCraft 브랜딩 |
| Pro | $19/월 | 무제한 페이지, 브랜딩 제거, 커스텀 도메인 |
| Team | $49/월 | Pro 전체 + 팀 협업, API, 분석 |

---

## 6. 주요 기능

- **AI 페이지 생성**: Claude API로 완성된 HTML 랜딩페이지 생성
- **AI 채팅 에디터**: 자연어로 페이지 수정 ("히어로 섹션 더 대담하게")
- **섹션별 AI 편집**: 개별 섹션 재생성, 순서 변경, 삭제
- **라이브 에디터**: 미리보기 + 코드 편집 + 반응형 디바이스 전환
- **템플릿 갤러리**: 12개 프리셋 템플릿 (카테고리별 필터)
- **다국어 생성**: 8개 언어 지원 (한/영/일/중/스/프/독/포)
- **원클릭 퍼블리시**: `/p/[slug]`에 페이지 게시
- **HTML 내보내기**: 생성된 페이지 HTML 파일 다운로드
- **A/B 테스트**: AI 변형 생성, 트래픽 분할, 전환 추적
- **리드 수집**: 이메일 캡처 폼, 웹훅, CSV 내보내기
- **전환 분석**: 페이지 뷰, CTA 클릭, 기기/국가별 분석
- **Stripe 결제**: 구독 관리 + 고객 포탈
- **인증**: 이메일/비밀번호 + Google OAuth (Supabase)
- **팀 워크스페이스**: 팀 생성, 멤버 초대, 역할 관리
- **브랜드킷**: 컬러, 폰트, 톤 저장 → AI 생성 시 반영
- **공개 API**: REST API (Team 플랜, API 키 인증)
- **서드파티 연동**: GA, GTM, Facebook Pixel, TikTok Pixel, Zapier, Mailchimp, ConvertKit
- **추천 프로그램**: 추천 링크, 보상, 통계 대시보드
- **바이럴 뱃지**: Free 플랜 "Made with PageCraft" 배지 (추천 추적 포함)
- **RLS 보안**: 모든 DB 테이블에 행 수준 보안 정책
- **로컬 개발**: SQLite 파일 DB로 외부 서비스 없이 개발 가능
