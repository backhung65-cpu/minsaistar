import Link from "next/link";
import { listCategories, listProducts } from "@/lib/repo";
import {
  BeforeAfter, DifferenceSection, ExpertSection, Faq, FinalCta,
  PricingCompare, ProblemSection, PromptPreview,
} from "@/components/Sections";
import { FreeSample, ProductShowcase } from "@/components/Funnel";
import { StickyCta } from "@/components/StickyCta";
import { sampleProduct } from "@/content/sample-product";
import { won } from "@/lib/format";
import type { FaqItem } from "@/lib/types";

export const dynamic = "force-dynamic";

/** 홈 = 구매 퍼널: 공감 → 무료 체험 → 상품 선택 → 결과 · 신뢰 → 가격 기준점 → 결정 */
const FUNNEL_FAQ: FaqItem[] = [
  { q: "무료 맛보기와 유료 상품은 무엇이 다른가요?", a: "무료 맛보기는 현재 상태를 진단하는 짧은 프롬프트입니다. 유료 상품은 진단 이후 전략 수립 · 집필 · 실행안까지 결과물이 나올 때까지 이어지는 전체 과정을 담고 있습니다." },
  { q: "단품과 멤버십 중 무엇을 선택해야 하나요?", a: "필요한 상품이 하나라면 단품(220,000원, 평생 이용)을, 두 상품을 모두 쓰거나 앞으로 추가될 콘텐츠까지 원하면 멤버십(월 55,000원)을 권합니다." },
  { q: "결제 후 바로 사용할 수 있나요?", a: "네. 결제가 확인되면 바로 프롬프트를 열고 복사하거나 GPT를 실행할 수 있습니다." },
  { q: "회원가입이 필요한가요?", a: "아니요. 이름 · 휴대전화 · 이메일만 입력하면 구매할 수 있고, 다른 기기에서는 이메일 인증으로 다시 열 수 있습니다." },
  { q: "멤버십은 언제든 해지할 수 있나요?", a: "네. 해지 후에도 이미 결제한 기간이 끝날 때까지 이용할 수 있습니다." },
  { q: "환불이 가능한가요?", a: "디지털 콘텐츠 특성상 열람 · 다운로드 · GPT 실행 이후에는 환불이 제한됩니다. 이용 전에는 고객센터로 문의해 주세요." },
];

export default async function Home() {
  const [products, categories] = await Promise.all([listProducts({ publishedOnly: true }), listCategories()]);
  const catName = new Map(categories.map((c) => [c.id, c.name]));
  const featured = products.find((p) => p.prompt_content) ?? products[0];
  const preview = featured?.preview_content || sampleProduct.preview_content;
  const bundleValue = products.filter((p) => p.membership_included).reduce((a, p) => a + p.sale_price, 0);

  return (
    <>
      {/* 1. 주목 — 결과를 약속하는 헤드라인, 부담 없는 첫 행동(무료 체험) */}
      <section className="overflow-hidden bg-canvas pt-14 md:pt-20">
        <div className="container-x text-center">
          <div className="eyebrow">MIRACLE PROMPT</div>
          <h1 className="h1 mt-2 text-balance text-ink">
            민진홍의 마케팅 사고를<br className="hidden sm:block" /> 프롬프트로 소유하세요.
          </h1>
          <p className="lead mx-auto mt-4 max-w-2xl text-balance">
            현장에서 축적한 마케팅 전략과 실행 프로세스를 AI에서 바로 쓰는 프롬프트로.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="#free" className="btn-primary">무료로 먼저 써 보기</Link>
            <Link href="#products" className="btn-outline">상품 보기</Link>
          </div>
          <p className="mt-5 text-[14px] text-sub">
            상품 하나 {won(220_000)} · 미라클 멤버십 월 {won(55_000)}으로 전부 이용
          </p>
        </div>
        <div className="container-x mt-12 pb-16 md:mt-16 md:pb-20">
          <div className="mx-auto max-w-3xl">
            <PromptPreview content={preview} shadow />
          </div>
        </div>
      </section>

      {/* 2. 공감 */}
      <ProblemSection tone="parchment" />
      <DifferenceSection tone="dark" />

      {/* 3. 무료 체험 */}
      <FreeSample tone="light" />

      {/* 4. 상품 선택 */}
      <ProductShowcase
        tone="parchment"
        products={products}
        categoryName={(p) => (p.category_id ? catName.get(p.category_id) : undefined)}
      />

      {/* 5. 확신 — 결과와 전문가 */}
      <BeforeAfter tone="light" />
      <ExpertSection tone="parchment" />

      {/* 6. 결정 — 가격 기준점 */}
      <PricingCompare tone="light" singleHref="#products" singleLabel="상품 선택하기" bundleValue={bundleValue} />
      <Faq tone="parchment" items={FUNNEL_FAQ} />
      <FinalCta tone="dark" />
      <StickyCta />
    </>
  );
}
