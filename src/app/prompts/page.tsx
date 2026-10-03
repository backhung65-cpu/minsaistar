import type { Metadata } from "next";
import Link from "next/link";
import { listCategories, listProducts } from "@/lib/repo";
import { ProductCard } from "@/components/ProductCard";
import { StickyCta } from "@/components/StickyCta";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "PROMPT STORE",
  description: "민진홍 소장의 마케팅 · 고객분석 · 브랜딩 · 콘텐츠 · SNS · 광고 · 사업전략 프롬프트",
};

export default async function Store({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const [products, categories] = await Promise.all([listProducts({ publishedOnly: true }), listCategories()]);
  const active = categories.find((c) => c.slug === category);
  const list = active ? products.filter((p) => p.category_id === active.id) : products;
  const catName = new Map(categories.map((c) => [c.id, c.name]));

  return (
    <>
      <section className="bg-parchment">
        <div className="container-x pt-12 pb-6 md:pt-16">
          <h1 className="h1 text-ink">프롬프트 스토어.</h1>
          <p className="lead mt-3">민진홍의 마케팅 프롬프트. 하나 200,000원, 멤버십은 월 50,000원으로 전체 이용.</p>
          <nav className="no-scrollbar mt-8 flex gap-2 overflow-x-auto pb-1" aria-label="카테고리">
            {[{ slug: "", name: "전체" }, ...categories].map((c) => {
              const on = (c.slug || undefined) === active?.slug;
              return (
                <Link
                  key={c.slug || "all"}
                  href={c.slug ? `/prompts?category=${c.slug}` : "/prompts"}
                  aria-current={on ? "page" : undefined}
                  className={`shrink-0 rounded-full bg-canvas px-4 py-3 text-[14px] text-ink ${on ? "border-2 border-accent-focus" : "border border-hairline"}`}
                >
                  {c.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="container-x pb-16 md:pb-20">
          <div className="mb-5 text-[14px] text-sub">{list.length}개의 콘텐츠</div>
          {list.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((p) => (
                <ProductCard key={p.id} product={p} categoryName={p.category_id ? catName.get(p.category_id) : undefined} />
              ))}
            </div>
          ) : (
            <div className="card text-center text-sub">이 카테고리의 프롬프트를 준비하고 있습니다.</div>
          )}
        </div>
      </section>

      <section className="section bg-tile text-white">
        <div className="container-x text-center">
          <div className="eyebrow !text-muted-dark">MIRACLE MEMBERSHIP</div>
          <h2 className="h2 mt-2 text-balance">하나의 프롬프트는 200,000원.<br />멤버십은 월 50,000원으로 모든 자료를.</h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/checkout?plan=membership" className="btn-primary">멤버십 시작하기</Link>
            <Link href="/membership" className="btn border border-accent-dark text-accent-dark">더 알아보기</Link>
          </div>
        </div>
      </section>
      <StickyCta />
    </>
  );
}
