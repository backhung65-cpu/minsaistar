-- MIRACLE PROMPT — initial schema
-- Supabase SQL Editor 또는 `supabase db push`로 실행하세요.

create extension if not exists "pgcrypto";

-- ───────── CATEGORIES ─────────
create table if not exists categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name        text not null,
  sort_order  int  not null default 0
);

insert into categories (slug, name, sort_order) values
  ('marketing', '마케팅', 1),
  ('customer', '고객분석', 2),
  ('branding', '브랜딩', 3),
  ('content', '콘텐츠', 4),
  ('sns', 'SNS', 5),
  ('ads', '광고', 6),
  ('strategy', '사업전략', 7)
on conflict (slug) do nothing;

-- ───────── PRODUCTS ─────────
create table if not exists products (
  id                   uuid primary key default gen_random_uuid(),
  title                text not null,
  slug                 text unique not null,
  category_id          uuid references categories(id) on delete set null,
  short_description    text not null default '',
  description          text not null default '',
  thumbnail            text,
  regular_price        int  not null default 200000,
  sale_price           int  not null default 200000,
  product_type         text not null default 'PROMPT'
                       check (product_type in ('PROMPT','FILE','PROMPT_FILE','PACKAGE')),
  prompt_content       text not null default '',   -- 시스템(마스터) 프롬프트 전체
  input_template       text not null default '',   -- 입력 템플릿
  usage_example        text not null default '',   -- 사용 예제(입력 예시)
  result_example       text not null default '',   -- 결과 예제
  preview_content      text not null default '',   -- 판매 페이지 미리보기
  usage_guide          text not null default '',   -- 사용 방법
  problems             jsonb not null default '[]', -- 해결하는 문제 (string[])
  use_cases            jsonb not null default '[]', -- 활용 분야 (string[])
  faq                  jsonb not null default '[]', -- [{q,a}]
  changelog            jsonb not null default '[]', -- [{version,date,notes:string[]}]
  badges               jsonb not null default '[]', -- NEW/BEST/UPDATED/PACKAGE/MEMBERSHIP/FREE
  package_product_ids  jsonb not null default '[]', -- PACKAGE 상품 구성 (uuid[])
  membership_included  boolean not null default true,
  status               text not null default 'DRAFT'
                       check (status in ('DRAFT','PUBLISHED','HIDDEN','ARCHIVED')),
  version              text not null default '1.0',
  seo_title            text,
  seo_description      text,
  og_image             text,
  sort_order           int  not null default 0,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
create index if not exists products_status_idx on products(status);

-- ───────── PRODUCT_FILES ─────────
create table if not exists product_files (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references products(id) on delete cascade,
  file_name     text not null,
  file_type     text not null,        -- ZIP / PDF / MD / TXT / TEMPLATE ...
  storage_path  text not null,        -- 비공개 버킷 내부 경로 (공개 URL 금지)
  size_bytes    bigint not null default 0,
  created_at    timestamptz not null default now()
);

-- ───────── USERS ─────────
create table if not exists users (
  id          uuid primary key default gen_random_uuid(),
  name        text not null default '',
  email       text unique not null,
  phone       text not null default '',
  created_at  timestamptz not null default now()
);

-- ───────── ORDERS ─────────
create table if not exists orders (
  id                uuid primary key default gen_random_uuid(),
  order_number      text unique not null,      -- MIR-YYYYMMDD-XXXX
  user_id           uuid not null references users(id),
  product_id        uuid references products(id),
  order_type        text not null check (order_type in ('SINGLE','MEMBERSHIP')),
  amount            int  not null,
  payment_provider  text not null default 'PAYAPP',
  payment_id        text,                       -- PayApp mul_no
  rebill_id         text,                       -- PayApp rebill_no (정기결제)
  payment_status    text not null default 'PENDING'
                    check (payment_status in ('PENDING','PAID','FAILED','CANCELLED','REFUNDED')),
  raw_payload       jsonb,
  created_at        timestamptz not null default now(),
  paid_at           timestamptz
);
create index if not exists orders_user_idx on orders(user_id);
create index if not exists orders_status_idx on orders(payment_status);

-- ───────── ENTITLEMENTS (구매권한) ─────────
create table if not exists entitlements (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users(id),
  product_id  uuid references products(id),     -- 멤버십 권한은 null
  order_id    uuid references orders(id),
  type        text not null check (type in ('SINGLE','MEMBERSHIP')),
  status      text not null default 'ACTIVE' check (status in ('ACTIVE','REVOKED','EXPIRED')),
  starts_at   timestamptz not null default now(),
  expires_at  timestamptz
);
create index if not exists entitlements_user_idx on entitlements(user_id);

-- ───────── MEMBERSHIPS ─────────
create table if not exists memberships (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid unique not null references users(id),
  plan             text not null default 'MIRACLE_MONTHLY',
  status           text not null default 'ACTIVE' check (status in ('ACTIVE','CANCELLED','EXPIRED')),
  rebill_id        text,
  started_at       timestamptz not null default now(),
  next_payment_at  timestamptz,
  expired_at       timestamptz
);

-- ───────── DOWNLOADS ─────────
create table if not exists downloads (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references users(id),
  product_id     uuid references products(id),
  file_id        uuid references product_files(id) on delete set null,
  downloaded_at  timestamptz not null default now(),
  ip             text
);

-- ───────── ACCESS_CODES (이메일 재접속 인증) ─────────
create table if not exists access_codes (
  id          uuid primary key default gen_random_uuid(),
  email       text not null,
  code_hash   text not null,
  attempts    int  not null default 0,
  expires_at  timestamptz not null,
  used_at     timestamptz,
  created_at  timestamptz not null default now()
);
create index if not exists access_codes_email_idx on access_codes(email);

-- ───────── RLS ─────────
-- 모든 접근은 서버(service role)에서만 수행합니다. anon 키로는 어떤 테이블도 읽을 수 없습니다.
alter table categories    enable row level security;
alter table products      enable row level security;
alter table product_files enable row level security;
alter table users         enable row level security;
alter table orders        enable row level security;
alter table entitlements  enable row level security;
alter table memberships   enable row level security;
alter table downloads     enable row level security;
alter table access_codes  enable row level security;

-- ───────── STORAGE ─────────
-- 비공개 버킷 (공개 URL 없음, Signed URL로만 다운로드)
insert into storage.buckets (id, name, public)
values ('product-files', 'product-files', false)
on conflict (id) do nothing;

-- 공개 이미지(썸네일/OG) 버킷
insert into storage.buckets (id, name, public)
values ('public-assets', 'public-assets', true)
on conflict (id) do nothing;
