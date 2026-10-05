import Link from "next/link";
import { listCategories, listProducts } from "@/lib/repo";
import { ProductCard } from "@/components/ProductCard";
import {
  BeforeAfter, DifferenceSection, Deliverables, ExpertSection, Faq, FinalCta,
  PricingCompare, ProblemSection, PromptPreview, SectionHead, Tile,
} from "@/components/Sections";
import { StickyCta } from "@/components/StickyCta";
import { sampleProduct } from "@/content/sample-product";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [products, categories] = await Promise.all([listProducts({ publishedOnly: true }), listCategories()]);
  const catName = new Map(categories.map((c) => [c.id, c.name]));
  const featured = products.find((p) => p.badges.includes("BEST")) ?? products.find((p) => p.product_type !== "GPT");
  const gptCount = products.filter((p) => p.product_type === "GPT").length;
  const preview = featured?.preview_content || sampleProduct.preview_content;

  return (
    <>
      {/* HERO — 가운데 정렬 헤드라인 + 두 개의 알약 CTA + 제품(프롬프트) 이미지 */}
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
            <Link href="/checkout?plan=membership" className="btn-primary">미라클 멤버십 시작하기</Link>
            <Link href="/prompts" className="btn-outline">프롬프트 살펴보기</Link>
          </div>
          <p className="mt-5 text-[14px] text-sub">
            {gptCount > 0 ? `GPT 솔루션 ${gptCount}개와 프롬프트 전체 · 미라클 멤버십 월 55,000원` : "프리미엄 프롬프트 220,000원 · 미라클 멤버십 월 55,000원으로 모든 자료 이용"}
          </p>
        </div>
        <div className="container-x mt-12 pb-16 md:mt-16 md:pb-20">
          <div className="mx-auto max-w-3xl">
            <PromptPreview content={preview} shadow />
          </div>
        </div>
      </section>

      <ProblemSection tone="parchment" />
      <DifferenceSection tone="dark" />
      <ExpertSection tone="light" />
      <BeforeAfter tone="parchment" />

      {/* 스토어 */}
      <Tile tone="light">
        <div className="container-x">
          <SectionHead eyebrow="AI 솔루션 · 프롬프트" title="아이디어가 결과물이 되는 도구." desc="출판 · 연구 · 영상 · 이미지 · 홍보 · 비즈니스 · 마케팅까지." />
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {products.slice(0, 6).map((p) => (
              <ProductCard key={p.id} product={p} categoryName={p.category_id ? catName.get(p.category_id) : undefined} />
            ))}
            {products.length === 0 && <p className="text-sub">곧 첫 번째 프롬프트가 공개됩니다.</p>}
          </div>
          <div className="mt-10 text-center">
            <Link href="/prompts" className="link text-[17px]">전체 프롬프트 보기 ›</Link>
          </div>
        </div>
      </Tile>

      <Deliverables tone="parchment" />
      <PricingCompare tone="light" singleHref={featured ? `/prompts/${featured.slug}` : "/prompts"} />
      <Faq tone="parchment" />
      <FinalCta tone="dark" />
      <StickyCta />
    </>
  );
}
