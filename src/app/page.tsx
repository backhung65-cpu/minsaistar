import Link from "next/link";
import { listCategories, listProducts } from "@/lib/repo";
import { ProductCard } from "@/components/ProductCard";
import {
  BeforeAfter, DifferenceSection, Deliverables, ExpertSection, Faq, FinalCta,
  PricingCompare, ProblemSection, PromptPreview, SectionHead,
} from "@/components/Sections";
import { StickyCta } from "@/components/StickyCta";
import { sampleProduct } from "@/content/sample-product";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [products, categories] = await Promise.all([listProducts({ publishedOnly: true }), listCategories()]);
  const catName = new Map(categories.map((c) => [c.id, c.name]));
  const featured = products.find((p) => p.badges.includes("BEST")) ?? products[0];
  const preview = featured?.preview_content || sampleProduct.preview_content;

  return (
    <>
      {/* SECTION 01 — HERO */}
      <section className="relative overflow-hidden">
        <div className="container-x grid items-center gap-12 py-14 md:py-24 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
          <div>
            <div className="eyebrow">MIRACLE PROMPT · 미라클마케팅 연구소</div>
            <h1 className="mt-5 text-[34px] leading-[1.28] font-extrabold tracking-[-0.03em] text-navy sm:text-[44px] lg:text-[50px] xl:text-[58px] lg:leading-[1.2]">
              <span className="sm:whitespace-nowrap">민진홍의 <br className="sm:hidden" />마케팅 사고를</span><br />
              <span className="sm:whitespace-nowrap box-decoration-clone bg-[linear-gradient(transparent_68%,rgba(196,154,85,0.32)_68%)]">프롬프트로 소유하세요.</span>
            </h1>
            <p className="lead mt-6 max-w-xl">
              현장에서 축적한 마케팅 전략과 실행 프로세스를<br className="hidden sm:block" />
              AI에서 바로 사용할 수 있는 프롬프트로 제공합니다.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl border border-line bg-white px-6 py-5">
              <div>
                <div className="text-[12px] tracking-[0.14em] text-sub">단일 프롬프트</div>
                <div className="text-[22px] font-extrabold text-navy">200,000원</div>
              </div>
              <div className="text-[13px] font-semibold text-sub">또는</div>
              <div>
                <div className="text-[12px] font-bold tracking-[0.14em] text-gold-2">MIRACLE MEMBERSHIP</div>
                <div className="text-[22px] font-extrabold text-navy">월 50,000원 <span className="text-[14px] font-semibold text-sub">모든 자료 이용</span></div>
              </div>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/prompts" className="btn-outline py-4">프롬프트 살펴보기</Link>
              <Link href="/checkout?plan=membership" className="btn-primary py-4">미라클 멤버십 시작하기</Link>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -right-10 -top-10 hidden size-64 rounded-full bg-gold/15 blur-3xl lg:block" />
            <PromptPreview content={preview} />
          </div>
        </div>
      </section>

      <ProblemSection />
      <DifferenceSection />
      <ExpertSection />
      <BeforeAfter />

      {/* SECTION 06 — 상품 / 프롬프트 미리보기 */}
      <section className="section">
        <div className="container-x">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHead eyebrow="PROMPT STORE" title="지금 이용할 수 있는 프롬프트" desc="질문 하나가 아닙니다. 마케팅 전략을 만드는 사고 구조입니다." />
            <Link href="/prompts" className="btn-ghost shrink-0">전체 보기 →</Link>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {products.slice(0, 6).map((p) => (
              <ProductCard key={p.id} product={p} categoryName={p.category_id ? catName.get(p.category_id) : undefined} />
            ))}
            {products.length === 0 && <p className="text-sub">곧 첫 번째 프롬프트가 공개됩니다.</p>}
          </div>
        </div>
      </section>

      <Deliverables />
      <PricingCompare singleHref={featured ? `/prompts/${featured.slug}` : "/prompts"} />
      <Faq />
      <FinalCta />
      <StickyCta />
    </>
  );
}
