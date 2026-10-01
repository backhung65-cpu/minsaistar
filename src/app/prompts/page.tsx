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
      <section className="border-b border-line bg-white">
        <div className="container-x py-14 md:py-20">
          <div className="eyebrow">PROMPT STORE</div>
          <h1 className="h2 mt-4 text-navy">민진홍의 마케팅 프롬프트</h1>
          <p className="lead mt-4">프롬프트 1개 200,000원 · 미라클 멤버십 월 50,000원으로 전체 이용</p>
        </div>
        <div className="container-x">
          <nav className="no-scrollbar -mb-px flex gap-1 overflow-x-auto">
            {[{ slug: "", name: "전체" }, ...categories].map((c) => {
              const on = (c.slug || undefined) === (active?.slug);
              return (
                <Link
                  key={c.slug || "all"}
                  href={c.slug ? `/prompts?category=${c.slug}` : "/prompts"}
                  className={`shrink-0 border-b-2 px-4 py-4 text-[15px] font-semibold transition ${on ? "border-navy text-navy" : "border-transparent text-sub hover:text-navy"}`}
                >
                  {c.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </section>

      <section className="container-x py-12 md:py-16">
        <div className="mb-6 text-[14px] text-sub">총 <b className="text-navy">{list.length}</b>개의 콘텐츠</div>
        {list.length ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {list.map((p) => (
              <ProductCard key={p.id} product={p} categoryName={p.category_id ? catName.get(p.category_id) : undefined} />
            ))}
          </div>
        ) : (
          <div className="card text-center text-sub">이 카테고리의 프롬프트를 준비하고 있습니다.</div>
        )}

        <div className="mt-16 flex flex-col items-start justify-between gap-6 rounded-[22px] bg-navy p-8 text-white md:flex-row md:items-center md:p-10">
          <div>
            <div className="eyebrow">MIRACLE MEMBERSHIP</div>
            <div className="mt-3 text-[22px] md:text-[26px] font-bold">하나의 프롬프트는 200,000원.<br className="md:hidden" /> 멤버십은 월 50,000원으로 모든 자료를.</div>
          </div>
          <Link href="/membership" className="btn-gold shrink-0">멤버십 알아보기</Link>
        </div>
      </section>
      <StickyCta />
    </>
  );
}
