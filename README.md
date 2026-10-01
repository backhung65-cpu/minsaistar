# MIRACLE PROMPT

> 민진홍의 마케팅 사고를 프롬프트로 소유하세요.

프롬프트 단품 판매(200,000원)와 **MIRACLE MEMBERSHIP**(월 50,000원) 콘텐츠 라이브러리를 함께 운영하는 지식 커머스 웹서비스입니다.

- **Frontend**: Next.js 15 (App Router) · Tailwind CSS v4 · Pretendard
- **Database / Storage**: Supabase (Postgres + 비공개 Storage 버킷)
- **Payment**: PayApp (단건 결제 + 월 정기결제)
- **Hosting**: Vercel

환경변수 없이 실행하면 **데모 모드**로 동작합니다. 데모 모드는 `.data/` 폴더의 JSON 저장소와 모의 결제를 사용하고, 샘플 상품이 자동으로 등록됩니다.

---

## 빠른 시작 (데모 모드)

```bash
npm install
npm run dev
# http://localhost:3000        사이트
# http://localhost:3000/admin  관리자 (데모 비밀번호: admin)
```

데모 모드에서 해 볼 수 있는 것:

1. `/prompts/marketing-master` → 단품 구매 → 모의 결제 → 결제완료 → Prompt Viewer에서 복사·다운로드
2. `/membership` → 멤버십 결제 → 멤버십 라이브러리
3. 다른 브라우저에서 `/access` → 이메일 인증(인증코드는 화면에 표시됨) → 내 콘텐츠

---

## 운영 환경 설정

### 1. Supabase

1. 프로젝트를 생성합니다.
2. SQL Editor에서 `supabase/migrations/0001_init.sql`을 실행합니다.
   - 테이블: `categories, products, product_files, users, orders, entitlements, memberships, downloads, access_codes`
   - 모든 테이블에 RLS가 켜져 있고 정책이 없으므로 **anon 키로는 접근할 수 없습니다.** 모든 데이터 접근은 서버(service role)에서만 합니다.
   - Storage 버킷: `product-files`(비공개, 상품 자료) / `public-assets`(공개, 썸네일)
3. `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`를 환경변수에 넣습니다.
4. 관리자 › 상품 관리 › **샘플 상품 등록**으로 첫 상품(마케팅 전략 마스터 프롬프트)을 등록할 수 있습니다.

### 2. PayApp

1. PayApp 판매자 관리자 › 설정 › 연동정보에서 `아이디(userid)`, `연동KEY(linkkey)`, `연동VALUE(linkval)`를 확인합니다.
2. 환경변수 `PAYAPP_USERID`, `PAYAPP_LINKKEY`, `PAYAPP_LINKVAL`, `NEXT_PUBLIC_SITE_URL`을 설정합니다.
3. 결제 통보 URL은 코드에서 자동으로 `{SITE_URL}/api/payapp/feedback`으로 전달됩니다.
4. 정기결제(멤버십)를 쓰려면 PayApp에서 정기결제 서비스가 활성화되어 있어야 합니다.

### 3. 기타 환경변수

| 변수 | 설명 |
|---|---|
| `APP_SECRET` | 세션·다운로드 토큰 서명키 (16자 이상, 운영 필수) |
| `ADMIN_PASSWORD` | `/admin` 로그인 비밀번호 (운영 필수) |
| `RESEND_API_KEY`, `MAIL_FROM` | 재접속 인증코드 메일 발송 ([Resend](https://resend.com)) |

`.env.example`을 참고하세요.

### 4. Vercel 배포

GitHub 저장소를 Vercel에 연결하고 위 환경변수를 등록하면 됩니다. Vercel은 파일시스템이 읽기 전용이라 데모 모드 데이터가 유지되지 않으므로, 운영 환경에서는 반드시 Supabase를 연결하세요.

---

## 결제 흐름과 보안

```
구매하기 → 주문 생성(PENDING, MIR-YYYYMMDD-XXXXXX)
        → PayApp 결제창 (var1 = 내부 주문번호)
        → PayApp 서버 통보 POST /api/payapp/feedback
            · userid / linkkey / linkval 일치 확인
            · var1로 주문 조회, 결제금액 = 주문금액 확인
            · pay_state=4 → 주문 PAID → 구매권한(entitlements) 생성
        → 사용자 복귀 /api/payapp/return → /checkout/complete
            · DB의 payment_status = PAID 인 경우에만 콘텐츠 제공
```

- 결제완료 페이지에 접근했다는 사실만으로는 권한이 생기지 않습니다. 권한은 서버 통보가 검증된 뒤에만 생성됩니다.
- 같은 통보가 여러 번 와도 권한은 한 번만 만들어집니다. 정기결제 갱신(새 `mul_no`)이 오면 갱신 주문을 만들고 멤버십 기간을 1개월 연장합니다.
- 취소 통보(`pay_state` 9/64/70/71)가 오면 주문을 취소 상태로 바꾸고 권한을 회수합니다.

### 회원가입 없는 구매와 재접속

- 구매할 때는 이름·휴대전화·이메일만 받습니다.
- 결제한 브라우저에는 **해당 주문의 권한만** 연결됩니다. 다른 사람의 이메일을 입력해 결제해도 그 사람의 기존 구매 내역은 볼 수 없습니다.
- 다른 기기에서는 `/access`에서 이메일 인증코드(6자리, 10분 유효, 5회 제한)로 인증하면 해당 이메일의 전체 권한을 이용할 수 있습니다.

### 파일 다운로드

- 파일은 비공개 버킷에 저장되고, 공개 URL은 만들지 않습니다.
- `/api/download/{fileId}` 요청 → 구매권한 확인 → 60초짜리 Signed URL 생성 → 리다이렉트 순서로 처리하고, 다운로드 기록(`downloads`)을 남깁니다.
- 관리자 업로드는 브라우저가 Storage에 직접 올립니다(Signed Upload URL). 그래서 Vercel의 요청 크기 제한을 받지 않습니다.

---

## 디렉터리 구조

```
src/
  app/
    page.tsx                  HOME (Hero · 문제 · 차별성 · 전문가 · 결과 · 미리보기 · 구성 · 가격 · FAQ)
    prompts/                  PROMPT STORE (카테고리 필터)
    prompts/[slug]/           PRODUCT DETAIL (SEO · JSON-LD · 공유 · 모바일 Sticky CTA)
    membership/               MIRACLE MEMBERSHIP
    checkout/                 CHECKOUT · 모의결제 · PAYMENT COMPLETE
    viewer/[slug]/            PROMPT VIEWER (전체/시스템/템플릿/예제 복사 · 다운로드 · 변경이력)
    library/                  MEMBERSHIP LIBRARY (검색 · 카테고리 · 유형 필터 · NEW/UPDATED)
    my/  access/              MY CONTENT · 이메일 인증 재접속
    admin/                    ADMIN (대시보드 · 상품 · 파일 · 주문 · 멤버십)
    api/payapp/feedback       PayApp 결제 통보
    api/download/[fileId]     권한 확인 후 Signed URL 발급
  lib/
    db/adapter.ts             Supabase / 로컬 JSON 어댑터
    repo.ts                   도메인 데이터 접근
    payments.ts               결제 검증 · 권한 생성 · 멤버십 연장 · 취소
    payapp.ts                 PayApp API
    access.ts                 이용 권한 계산
    session.ts                구매자 세션 · 관리자 인증
  content/
    expert.ts                 민진홍 소장 소개 (⚠ [ ] 항목을 실제 정보로 교체)
    sample-product.ts         초기 상품: 마케팅 전략 마스터 프롬프트
supabase/migrations/0001_init.sql
```

## 운영 체크리스트

- [ ] `src/content/expert.ts`의 `[ ]` 표시 항목(저서·강의·경력 수치)을 실제 정보로 교체
- [ ] `public/`에 프로필 사진을 넣고 `expert.photo` 경로 변경
- [ ] `/terms`, `/privacy` 정책 문서를 사업자 정보에 맞게 수정
- [ ] 푸터에 사업자 정보(상호, 대표자, 사업자등록번호, 통신판매업 신고번호) 추가
- [ ] PayApp 실결제 1회 테스트 후 관리자에서 환불 처리 확인
