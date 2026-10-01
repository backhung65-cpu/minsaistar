"use client";
import { useActionState, useState } from "react";
import { saveProductAction, requestImageUpload, type SaveState } from "@/app/admin/(panel)/actions";
import type { Category, Product } from "@/lib/types";

const BADGES = ["NEW", "BEST", "UPDATED", "PACKAGE", "MEMBERSHIP", "FREE"] as const;

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {hint && <p className="mt-1 text-[12px] text-sub">{hint}</p>}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="card space-y-5 !p-6">
      <legend className="sr-only">{title}</legend>
      <h2 className="text-[16px] font-bold text-navy">{title}</h2>
      {children}
    </fieldset>
  );
}

const mono = "input font-mono text-[13px] leading-relaxed";

export function ProductForm({ product, categories, others }: { product?: Product; categories: Category[]; others: Product[] }) {
  const [state, action, pending] = useActionState<SaveState, FormData>(saveProductAction, {});
  const [thumb, setThumb] = useState(product?.thumbnail ?? "");
  const [type, setType] = useState(product?.product_type ?? "PROMPT_FILE");
  const [uploading, setUploading] = useState(false);
  const p = product;

  async function uploadThumb(file: File) {
    setUploading(true);
    try {
      const { uploadUrl, publicUrl } = await requestImageUpload(file.name);
      const res = await fetch(uploadUrl, { method: "PUT", body: file, headers: { "content-type": file.type || "application/octet-stream" } });
      if (!res.ok) throw new Error(await res.text());
      setThumb(publicUrl);
    } catch (e) {
      alert(`업로드 실패: ${e instanceof Error ? e.message : e}`);
    } finally {
      setUploading(false);
    }
  }

  const faqText = (p?.faq ?? []).map((f) => `${f.q}\n${f.a}`).join("\n\n");
  const changelogText = (p?.changelog ?? []).map((c) => `${c.version} | ${c.date}\n${c.notes.map((n) => `- ${n}`).join("\n")}`).join("\n\n");

  return (
    <form action={action} className="space-y-6">
      {p && <input type="hidden" name="id" value={p.id} />}

      <Section title="기본 정보">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="상품명"><input name="title" defaultValue={p?.title} required className="input" /></Field>
          <Field label="Slug" hint="URL: /prompts/{slug} · 영문 소문자, 숫자, -"><input name="slug" defaultValue={p?.slug} required className="input font-mono" placeholder="customer-analysis" /></Field>
          <Field label="카테고리">
            <select name="category_id" defaultValue={p?.category_id ?? ""} className="input">
              <option value="">선택 안 함</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="상품 유형">
            <select name="product_type" value={type} onChange={(e) => setType(e.target.value as Product["product_type"])} className="input">
              <option value="PROMPT">PROMPT — 프롬프트 열기 / 전체 복사</option>
              <option value="FILE">FILE — 파일 다운로드</option>
              <option value="PROMPT_FILE">PROMPT + FILE — 프롬프트 + ZIP/PDF</option>
              <option value="PACKAGE">PACKAGE — 여러 상품 묶음</option>
            </select>
          </Field>
        </div>
        <Field label="한 줄 설명"><input name="short_description" defaultValue={p?.short_description} className="input" /></Field>
        <Field label="상세 설명"><textarea name="description" defaultValue={p?.description} rows={6} className="input" /></Field>
        <Field label="썸네일" hint="비워 두면 책 표지 형태의 기본 썸네일이 생성됩니다.">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <input name="thumbnail" value={thumb} onChange={(e) => setThumb(e.target.value)} className="input" placeholder="https://..." />
            <label className="btn-outline btn-sm shrink-0 cursor-pointer">
              {uploading ? "업로드 중..." : "이미지 업로드"}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadThumb(e.target.files[0])} />
            </label>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {thumb && <img src={thumb} alt="" className="mt-3 h-28 rounded-xl border border-line object-cover" />}
        </Field>
      </Section>

      <Section title="가격 · 판매 설정">
        <div className="grid gap-5 md:grid-cols-4">
          <Field label="정상가격"><input name="regular_price" defaultValue={p?.regular_price ?? 200000} inputMode="numeric" className="input" /></Field>
          <Field label="판매가격"><input name="sale_price" defaultValue={p?.sale_price ?? 200000} inputMode="numeric" className="input" /></Field>
          <Field label="판매 상태">
            <select name="status" defaultValue={p?.status ?? "DRAFT"} className="input">
              <option value="DRAFT">DRAFT — 작성중</option>
              <option value="PUBLISHED">PUBLISHED — 판매중</option>
              <option value="HIDDEN">HIDDEN — 숨김</option>
              <option value="ARCHIVED">ARCHIVED — 보관</option>
            </select>
          </Field>
          <Field label="정렬 순서"><input name="sort_order" defaultValue={p?.sort_order ?? 0} inputMode="numeric" className="input" /></Field>
        </div>
        <label className="flex items-center justify-between gap-4 rounded-xl border border-line bg-ivory p-4">
          <span>
            <span className="block font-bold text-navy">멤버십 포함</span>
            <span className="text-[13px] text-sub">ON: 미라클 멤버십에서 이용 가능 · OFF: 단품 구매 전용 (프리미엄 상품)</span>
          </span>
          <input type="checkbox" name="membership_included" defaultChecked={p?.membership_included ?? true} className="size-5 accent-[#152238]" />
        </label>
        <Field label="상품 상태 표시">
          <div className="flex flex-wrap gap-2">
            {BADGES.map((b) => (
              <label key={b} className="flex cursor-pointer items-center gap-2 rounded-full border border-line bg-white px-3 py-1.5 text-[13px] font-semibold has-[:checked]:border-navy has-[:checked]:bg-navy has-[:checked]:text-white">
                <input type="checkbox" name="badges" value={b} defaultChecked={p?.badges.includes(b)} className="hidden" />{b}
              </label>
            ))}
          </div>
        </Field>
        {type === "PACKAGE" && (
          <Field label="패키지 구성 상품">
            <div className="grid gap-2 md:grid-cols-2">
              {others.map((o) => (
                <label key={o.id} className="flex items-center gap-2 text-[14px]">
                  <input type="checkbox" name="package_product_ids" value={o.id} defaultChecked={p?.package_product_ids.includes(o.id)} />{o.title}
                </label>
              ))}
            </div>
          </Field>
        )}
      </Section>

      {type !== "FILE" && (
        <Section title="프롬프트">
          <Field label="프롬프트 원문 (시스템 프롬프트)" hint="구매자만 열람 가능합니다."><textarea name="prompt_content" defaultValue={p?.prompt_content} rows={18} className={mono} /></Field>
          <Field label="프롬프트 미리보기" hint="판매 페이지에 노출됩니다. 후반부는 자동으로 Blur 처리됩니다."><textarea name="preview_content" defaultValue={p?.preview_content} rows={10} className={mono} /></Field>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="입력 템플릿"><textarea name="input_template" defaultValue={p?.input_template} rows={10} className={mono} /></Field>
            <Field label="사용 예제 (입력 예시)"><textarea name="usage_example" defaultValue={p?.usage_example} rows={10} className={mono} /></Field>
          </div>
          <Field label="결과 예제"><textarea name="result_example" defaultValue={p?.result_example} rows={10} className={mono} /></Field>
          <Field label="사용 방법" hint="한 줄에 한 단계"><textarea name="usage_guide" defaultValue={p?.usage_guide} rows={5} className="input" /></Field>
        </Section>
      )}

      <Section title="상세페이지 콘텐츠">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="해결하는 문제" hint="한 줄에 하나"><textarea name="problems" defaultValue={p?.problems.join("\n")} rows={5} className="input" /></Field>
          <Field label="활용 분야" hint="한 줄에 하나"><textarea name="use_cases" defaultValue={p?.use_cases.join("\n")} rows={5} className="input" /></Field>
        </div>
        <Field label="FAQ" hint="첫 줄은 질문, 다음 줄부터 답변. 항목 사이는 빈 줄로 구분"><textarea name="faq" defaultValue={faqText} rows={8} className="input" /></Field>
      </Section>

      <Section title="버전 · 업데이트">
        <div className="grid gap-5 md:grid-cols-[200px_1fr]">
          <Field label="현재 버전"><input name="version" defaultValue={p?.version ?? "1.0"} className="input font-mono" /></Field>
          <Field label="변경 이력" hint={'형식: "2.0 | 2026.10.01" 다음 줄부터 "- 변경 내용". 항목 사이는 빈 줄'}>
            <textarea name="changelog" defaultValue={changelogText} rows={6} className={mono} />
          </Field>
        </div>
      </Section>

      <Section title="SEO">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="SEO Title"><input name="seo_title" defaultValue={p?.seo_title ?? ""} className="input" /></Field>
          <Field label="OG Image URL"><input name="og_image" defaultValue={p?.og_image ?? ""} className="input" /></Field>
        </div>
        <Field label="SEO Description"><textarea name="seo_description" defaultValue={p?.seo_description ?? ""} rows={2} className="input" /></Field>
      </Section>

      <div className="sticky bottom-0 z-10 -mx-5 flex items-center justify-end gap-3 border-t border-line bg-ivory/95 px-5 py-4 backdrop-blur md:-mx-10 md:px-10">
        {state.error && <span className="mr-auto text-[14px] text-red-700">{state.error}</span>}
        {state.ok && <span className="mr-auto text-[14px] text-emerald-700">✓ 저장되었습니다.</span>}
        {p && <a href={`/prompts/${p.slug}`} target="_blank" className="btn-outline btn-sm">미리보기 ↗</a>}
        <button disabled={pending} className="btn-primary btn-sm px-8">{pending ? "저장 중..." : "저장"}</button>
      </div>
    </form>
  );
}
