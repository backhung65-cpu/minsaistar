import Link from "next/link";
import type { Product } from "@/lib/types";
import { won } from "@/lib/format";
import { CopyButton } from "./CopyButton";
import { ProductThumb } from "./ProductThumb";
import { SectionHead, Tile, type Tone } from "./Sections";

/**
 * 구매 퍼널
 *  1. 관심: 문제 공감
 *  2. 체험: 무료 맛보기 프롬프트 (결제 없이 바로 사용 → 결과로 신뢰 형성)
 *  3. 선택: 두 가지 실행 시스템 비교
 *  4. 확신: 결과 · 전문가 · FAQ
 *  5. 결정: 가격 기준점(단품 합계 vs 멤버십) → 결제
 *  6. 확장: 결제 후 멤버십 업그레이드 제안
 */

export const FREE_PROMPT = `[ROLE]
당신은 중소기업과 1인 사업자의 마케팅을 진단하는 컨설턴트입니다.

[TASK]
아래 5가지 질문을 한 번에 하나씩 묻고, 제 답을 들은 뒤 다음 질문으로 넘어가세요.
1. 무엇을 누구에게 팔고 있나요?
2. 고객은 주로 어디에서 우리를 알게 되나요?
3. 문의 또는 방문한 사람 중 실제로 구매하는 비율은 어느 정도인가요?
4. 한 번 구매한 고객이 다시 구매하나요?
5. 지금 가장 답답한 마케팅 문제는 무엇인가요?

[OUTPUT]
5가지 답을 모두 들은 뒤 다음 형식으로 정리하세요.
- 현재 마케팅의 가장 큰 병목 1가지와 그 이유
- 이번 주에 바로 할 수 있는 일 3가지 (구체적인 행동으로)
- 더 깊이 분석해야 할 영역 1가지`;

/** 2단계: 무료 맛보기 */
export function FreeSample({ tone = "light" }: { tone?: Tone }) {
  return (
    <Tile tone={tone} id="free">
      <div className="container-x grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center">
        <div>
          <div className="eyebrow">무료 맛보기</div>
          <h2 className="h2 mt-2 text-balance text-ink">결제 전에 먼저 써 보세요.</h2>
          <p className="mt-4 text-[17px] text-ink-80">
            3분 마케팅 진단 프롬프트입니다. ChatGPT · Claude · Gemini에 붙여 넣고 질문에 답하면, 지금 마케팅의 가장 큰 병목과 이번 주에 할 일 3가지를 정리해 줍니다.
          </p>
          <ol className="mt-6 space-y-2 text-[15px] text-ink-80">
            <li><b className="font-semibold text-ink">1.</b> 아래 [무료 프롬프트 복사]를 누릅니다.</li>
            <li><b className="font-semibold text-ink">2.</b> AI 새 대화창에 붙여 넣습니다.</li>
            <li><b className="font-semibold text-ink">3.</b> 질문 5개에 답합니다.</li>
          </ol>
          <p className="mt-6 text-[14px] text-sub">
            진단 결과가 도움이 되었다면, 전체 전략을 설계하는 <Link href="/prompts/marketing-master" className="link">마케팅 전략 마스터 프롬프트</Link>로 이어서 진행하세요.
          </p>
        </div>
        <div className="prompt-box overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-3.5 font-sans">
            <span className="text-[12px] font-semibold text-muted-dark">3분 마케팅 진단 · 무료</span>
            <CopyButton text={FREE_PROMPT} label="무료 프롬프트 복사" doneLabel="✓ 복사되었습니다" className="btn-primary btn-sm" />
          </div>
          <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap px-6 py-5">{FREE_PROMPT}</pre>
        </div>
      </div>
    </Tile>
  );
}

/** 3단계: 두 가지 실행 시스템 */
export function ProductShowcase({
  products, categoryName, tone = "parchment",
}: { products: Product[]; categoryName: (p: Product) => string | undefined; tone?: Tone }) {
  if (!products.length) return null;
  return (
    <Tile tone={tone} id="products">
      <div className="container-x">
        <SectionHead
          eyebrow="실행 시스템"
          title={products.length > 1 ? `목적에 맞는 ${products.length}가지 실행 시스템.` : "바로 실행하는 시스템."}
          desc="질문 하나가 아니라, 결과물이 나올 때까지 이어지는 과정 전체를 드립니다."
        />
        <div className={`mx-auto mt-12 grid gap-5 ${products.length > 1 ? "max-w-5xl md:grid-cols-2" : "max-w-xl"}`}>
          {products.map((p) => (
            <article key={p.id} className="flex flex-col overflow-hidden rounded-[18px] border border-hairline bg-canvas">
              <div className="p-3 pb-0"><ProductThumb product={p} categoryName={categoryName(p)} className="rounded-[8px]" /></div>
              <div className="flex flex-1 flex-col p-6 md:p-8">
                <div className="text-[14px] text-sub">{categoryName(p) ?? "프롬프트"} · {p.product_type === "GPT" ? "GPT 솔루션" : "프롬프트 + 자료"}</div>
                <h3 className="mt-1 text-[24px] font-semibold leading-[1.2] tracking-[-0.01em] text-ink">{p.title}</h3>
                <p className="mt-2 text-[17px] text-ink-80">{p.short_description}</p>
                {p.output && <p className="mt-3 text-[14px] text-sub"><b className="font-semibold text-ink">결과물</b> · {p.output}</p>}
                <div className="mt-6 flex-1" />
                <div className="flex items-baseline justify-between border-t border-hairline pt-5">
                  <span className="text-[17px] text-ink">{p.sale_price > 0 ? won(p.sale_price) : "멤버십 전용"}</span>
                  {p.membership_included && <span className="text-[14px] text-sub">또는 멤버십 월 55,000원</span>}
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link href={`/prompts/${p.slug}`} className="btn-primary">자세히 보기</Link>
                  {p.sale_price > 0 && <Link href={`/checkout?product=${p.slug}`} className="btn-outline">바로 구매</Link>}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </Tile>
  );
}

/** 결제 단계 표시 */
export function CheckoutSteps({ current }: { current: 1 | 2 | 3 | 4 }) {
  const steps = ["상품 선택", "정보 입력", "결제", "바로 사용"];
  return (
    <ol className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[14px]" aria-label="결제 단계">
      {steps.map((s, i) => {
        const n = i + 1;
        const state = n < current ? "done" : n === current ? "now" : "next";
        return (
          <li key={s} className="flex items-center gap-2" aria-current={state === "now" ? "step" : undefined}>
            <span className={`flex size-6 items-center justify-center rounded-full text-[12px] font-semibold ${state === "next" ? "bg-parchment text-sub" : "bg-accent text-white"}`}>
              {state === "done" ? "✓" : n}
            </span>
            <span className={state === "now" ? "font-semibold text-ink" : "text-sub"}>{s}</span>
            {n < steps.length && <span className="text-hairline" aria-hidden>—</span>}
          </li>
        );
      })}
    </ol>
  );
}

/** 결제 화면 플랜 전환 (단품 ↔ 멤버십) */
export function PlanSwitcher({
  product, isMembership, bundleValue,
}: { product?: Product | null; isMembership: boolean; bundleValue: number }) {
  const singleHref = product ? `/checkout?product=${product.slug}` : "/prompts";
  const memberHref = `/checkout?plan=membership${product ? `&from=${product.slug}` : ""}`;
  const opt = (on: boolean) => `flex items-center justify-between gap-4 rounded-[18px] bg-canvas px-5 py-4 ${on ? "border-2 border-accent-focus" : "border border-hairline hover:border-ink/40"}`;
  return (
    <div className="grid gap-3" role="radiogroup" aria-label="구매 방법">
      <Link href={singleHref} role="radio" aria-checked={!isMembership} className={opt(!isMembership)}>
        <span>
          <span className="block text-[17px] font-semibold text-ink">단품 구매</span>
          <span className="block text-[14px] text-sub">{product ? product.title : "상품 1개 선택"} · 평생 이용</span>
        </span>
        <span className="shrink-0 text-[17px] text-ink">{won(product?.sale_price ?? 220_000)}</span>
      </Link>
      <Link href={memberHref} role="radio" aria-checked={isMembership} className={opt(isMembership)}>
        <span>
          <span className="flex items-center gap-2 text-[17px] font-semibold text-ink">미라클 멤버십 <span className="badge bg-accent text-white">추천</span></span>
          <span className="block text-[14px] text-sub">
            모든 상품 이용{bundleValue > 0 && <> · 단품 합계 <s>{won(bundleValue)}</s></>}
          </span>
        </span>
        <span className="shrink-0 text-[17px] text-ink">월 55,000원</span>
      </Link>
    </div>
  );
}

/** 결제 후 확장: 단품 구매자 → 멤버십 업그레이드 / 멤버 → 시작 안내 */
export function AfterPurchase({
  isMembership, purchased, others,
}: { isMembership: boolean; purchased?: Product | null; others: Product[] }) {
  if (isMembership) {
    return (
      <div className="rounded-[18px] bg-parchment p-6 text-left">
        <div className="text-[17px] font-semibold text-ink">이렇게 시작하세요</div>
        <ol className="mt-3 space-y-3">
          {others.map((p, i) => (
            <li key={p.id} className="flex items-center justify-between gap-4">
              <span className="text-[15px] text-ink-80"><b className="font-semibold text-ink">{i + 1}.</b> {p.title}</span>
              <Link href={`/viewer/${p.slug}`} className="link shrink-0 text-[15px]">열기 ›</Link>
            </li>
          ))}
        </ol>
      </div>
    );
  }
  const rest = others.filter((p) => p.id !== purchased?.id && p.membership_included);
  if (!rest.length) return null;
  const restValue = rest.reduce((a, p) => a + p.sale_price, 0);
  return (
    <div className="rounded-[18px] border-2 border-accent-focus p-6 text-left">
      <div className="text-[14px] font-semibold text-sub">다음 단계</div>
      <div className="mt-1 text-[19px] font-semibold leading-[1.3] text-ink">
        {rest.map((p) => p.title).join(", ")}도 함께 쓰고 싶다면.
      </div>
      <p className="mt-2 text-[15px] text-ink-80">
        미라클 멤버십은 월 55,000원으로 모든 상품과 앞으로 추가될 콘텐츠를 이용합니다.
        {restValue > 0 && <> 남은 상품을 단품으로 사면 {won(restValue)}입니다.</>}
      </p>
      <Link href="/checkout?plan=membership" className="btn-primary mt-5">멤버십으로 확장하기</Link>
    </div>
  );
}
