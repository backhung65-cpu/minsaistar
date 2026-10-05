-- GPT 솔루션(멤버십 전용) 지원 + 카테고리 개편
alter table products add column if not exists gpt_url   text;
alter table products add column if not exists guide_url text;
alter table products add column if not exists output    text not null default '';

alter table products drop constraint if exists products_product_type_check;
alter table products add constraint products_product_type_check
  check (product_type in ('PROMPT','FILE','PROMPT_FILE','PACKAGE','GPT'));

alter table products alter column regular_price set default 220000;
alter table products alter column sale_price    set default 220000;

-- 카테고리: 마케팅 · 출판·글쓰기 (이후 상품 추가 대비 분야 포함, 상품이 없는 카테고리는 화면에 표시되지 않음)
insert into categories (slug, name, sort_order) values
  ('marketing', '마케팅', 1),
  ('publishing', '출판·글쓰기', 2),
  ('research', '연구·학습', 3),
  ('shortform', '숏폼·영상', 4),
  ('image', '이미지·디자인', 5),
  ('promotion', '홍보·브랜딩', 6),
  ('business', '비즈니스·웹', 7)
on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order;

-- 사용하지 않는 이전 카테고리 정리 (상품이 연결되지 않은 경우만)
delete from categories c
where c.slug in ('customer','branding','content','sns','ads','strategy')
  and not exists (select 1 from products p where p.category_id = c.id);
