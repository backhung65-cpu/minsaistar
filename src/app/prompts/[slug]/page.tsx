import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, listCategories, listProductFiles, listProducts } from "@/lib/repo";
import { getSession, isAdmin } from "@/lib/session";
import { canAccess, getAccess } from "@/lib/access";
import { fileSize, PRODUCT_TYPE_LABEL, won } from "@/lib/format";
import { Badges } from "@/components/Badges";
import { ProductThumb } from "@/components/ProductThumb";
import { ShareButtons } from "@/components/ShareButtons";
import { StickyCta } from "@/components/StickyCta";
import { Deliverables, ExpertSection, Faq, LicenseNotice, PricingCompare, PromptPreview, SectionHead } from "@/components/Sections";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getProductBySlug((await params).slug);
  if (!p) return {};
  const title = p.seo_title || p.title;
  const description = p.seo_description || p.short_description;
  const image = p.og_image || p.thumbnail || undefined;
  return {
    title: { absolute: title.includes("MIRACLE") ? title : `${title} | MIRACLE PROMPT` },
    description,
    alternates: { canonical: `/prompts/${p.slug}` },
    openGraph: { title, description, url: `/prompts/${p.slug}`, images: image ? [image] : undefined },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  const admin = await isAdmin();
  if (!product || (product.status !== "PUBLISHED" && !admin)) notFound();

  const [categories, files, session, allProducts] = await Promise.all([
    listCategories(), listProductFiles(product.id), getSession(), listProducts({ publishedOnly: true }),
  ]);
  const access = await getAccess(session);
  const owned = canAccess(access, product);
  const category = categories.find((c) => c.id === product.category_id);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const packageItems = product.product_type === "PACKAGE" ? allProducts.filter((p) => product.package_product_ids.includes(p.id)) : [];
  const buyHref = `/checkout?product=${product.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.short_description,
    image: product.thumbnail || undefined,
    brand: { "@type": "Brand", name: "MIRACLE PROMPT" },
    offers: { "@type": "Offer", price: product.sale_price, priceCurrency: "KRW", availability: "https://schema.org/InStock", url: `${siteUrl}/prompts/${product.slug}` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {product.status !== "PUBLISHED" && (
        <div className="bg-gold py-2 text-center text-[13px] font-bold text-navy">관리자 미리보기 · 현재 상태: {product.status}</div>
      )}

      {/* 상단 요약 */}
      <section className="border-b border-line bg-white">
        <div className="container-x grid gap-10 py-10 md:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div className="self-start overflow-hidden rounded-[22px] border border-line">
            <ProductThumb product={product} categoryName={category?.name} />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <Link href={category ? `/prompts?category=${category.slug}` : "/prompts"} className="text-[13px] font-bold tracking-[0.18em] text-gold-2">
                {category?.name ?? "PROMPT"}
              </Link>
              <span className="text-[12px] tracking-[0.14em] text-sub">{PRODUCT_TYPE_LABEL[product.product_type]} · v{product.version}</span>
            </div>
            <h1 className="mt-3 text-[30px] font-extrabold leading-tight tracking-tight text-navy md:text-[40px]">{product.title}</h1>
            <p className="mt-4 text-[17px] leading-relaxed text-sub">{product.short_description}</p>
            <div className="mt-4"><Badges badges={product.badges} /></div>

            <div className="mt-8 rounded-2xl border border-line bg-ivory p-6">
              {owned ? (
                <>
                  <div className="text-[14px] font-bold text-emerald-700">✓ 이용 가능한 콘텐츠입니다</div>
                  <Link href={`/viewer/${product.slug}`} className="btn-primary mt-4 w-full py-4 text-[16px]">지금 프롬프트 열기</Link>
                </>
              ) : (
                <>
                  <div className="flex items-end justify-between">
                    <span className="text-[14px] text-sub">단품 구매</span>
                    <div className="text-right">
                      {product.regular_price > product.sale_price && <div className="text-[13px] text-sub line-through">{won(product.regular_price)}</div>}
                      <div className="text-[30px] font-extrabold text-navy">{won(product.sale_price)}</div>
                    </div>
                  </div>
                  <Link href={buyHref} className="btn-outline mt-4 w-full py-4">단품 구매</Link>
                  {product.membership_included && (
                    <>
                      <div className="my-5 flex items-center gap-3 text-[12px] text-sub"><span className="h-px flex-1 bg-line" />또는<span className="h-px flex-1 bg-line" /></div>
                      <div className="flex items-end justify-between">
                        <span className="text-[13px] font-bold tracking-[0.14em] text-gold-2">MIRACLE MEMBERSHIP</span>
                        <span className="text-[22px] font-extrabold text-navy">월 50,000원</span>
                      </div>
                      <Link href="/checkout?plan=membership" className="btn-primary mt-4 w-full py-4">멤버십으로 이용</Link>
                      <p className="mt-3 text-center text-[12.5px] text-sub">멤버십에 포함된 모든 프롬프트와 자료를 이용할 수 있습니다.</p>
                    </>
                  )}
                </>
              )}
            </div>
            <div className="mt-6 flex items-center justify-between">
              <span className="text-[13px] text-sub">공유하기</span>
              <ShareButtons url={`${siteUrl}/prompts/${product.slug}`} title={product.title} />
            </div>
          </div>
        </div>
      </section>

      {/* 상품 소개 */}
      <section className="section">
        <div className="container-x grid gap-12 md:grid-cols-[1fr_1.5fr]">
          <SectionHead eyebrow="ABOUT" title={<>질문 하나가 아닙니다.<br />사고 구조입니다.</>} />
          <div className="whitespace-pre-line text-[17px] leading-[1.9] text-ink">{product.description}</div>
        </div>
      </section>

      {/* 해결하는 문제 + 활용 분야 */}
      {(product.problems.length > 0 || product.use_cases.length > 0) && (
        <section className="section bg-white">
          <div className="container-x grid gap-8 md:grid-cols-2">
            {product.problems.length > 0 && (
              <div className="card">
                <div className="eyebrow">PROBLEMS</div>
                <h3 className="h3 mt-3 text-navy">이런 문제를 해결합니다</h3>
                <ul className="mt-6 space-y-4">
                  {product.problems.map((t, i) => (
                    <li key={t} className="flex gap-4 text-[16px]"><span className="font-mono text-gold">{String(i + 1).padStart(2, "0")}</span>{t}</li>
                  ))}
                </ul>
              </div>
            )}
            {product.use_cases.length > 0 && (
              <div className="card">
                <div className="eyebrow">USE CASES</div>
                <h3 className="h3 mt-3 text-navy">이렇게 활용합니다</h3>
                <div className="mt-6 flex flex-wrap gap-2.5">
                  {product.use_cases.map((t) => <span key={t} className="rounded-full border border-line bg-ivory px-4 py-2 text-[14.5px] font-medium text-navy">{t}</span>)}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 결과 예시 */}
      {product.result_example && (
        <section className="section">
          <div className="container-x">
            <SectionHead eyebrow="RESULT" title="이 프롬프트로 만들어지는 결과" desc="실제 입력 예시로 생성한 결과의 일부입니다." />
            <div className="mt-10 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
              {product.usage_example && (
                <div className="card">
                  <span className="badge bg-ivory-2 text-sub">INPUT</span>
                  <pre className="mt-4 whitespace-pre-wrap font-sans text-[14.5px] leading-relaxed text-ink">{product.usage_example}</pre>
                </div>
              )}
              <div className="card relative overflow-hidden ring-1 ring-gold/40">
                <span className="badge bg-gold text-navy">OUTPUT</span>
                <pre className="mt-4 max-h-[520px] overflow-hidden whitespace-pre-wrap font-sans text-[14.5px] leading-relaxed text-ink">{product.result_example}</pre>
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent" />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 프롬프트 미리보기 */}
      {product.preview_content && (
        <section className="section bg-white">
          <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.3fr]">
            <SectionHead eyebrow="PREVIEW" title="프롬프트 미리보기" desc="판매 전에는 전체 원문을 공개하지 않습니다. 구조와 흐름을 먼저 확인하세요." />
            <PromptPreview content={product.preview_content} title={product.title.toUpperCase()} />
          </div>
        </section>
      )}

      {/* 사용 방법 */}
      {product.usage_guide && (
        <section className="section">
          <div className="container-x">
            <SectionHead eyebrow="HOW TO USE" title="사용 방법" />
            <ol className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {product.usage_guide.split("\n").filter(Boolean).map((line, i) => (
                <li key={i} className="card">
                  <div className="font-mono text-[13px] text-gold">STEP {String(i + 1).padStart(2, "0")}</div>
                  <div className="mt-3 text-[15.5px] leading-relaxed text-ink">{line.replace(/^STEP\s*\d+\.?\s*/i, "")}</div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* 패키지 구성 */}
      {packageItems.length > 0 && (
        <section className="section bg-white">
          <div className="container-x">
            <SectionHead eyebrow="PACKAGE" title="패키지 구성" />
            <ul className="mt-8 divide-y divide-line border-y border-line">
              {packageItems.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-4">
                  <Link href={`/prompts/${p.slug}`} className="font-semibold text-navy hover:underline">{p.title}</Link>
                  <span className="text-[14px] text-sub">{won(p.sale_price)}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* 제공 자료 */}
      <Deliverables />
      {files.length > 0 && (
        <div className="container-x -mt-12 pb-16">
          <div className="card">
            <div className="text-[14px] font-bold text-navy">포함 파일</div>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {files.map((f) => (
                <li key={f.id} className="flex items-center gap-3 rounded-xl bg-ivory px-4 py-3 text-[14px]">
                  <span className="badge bg-navy text-white">{f.file_type}</span>
                  <span className="truncate">{f.file_name}</span>
                  <span className="ml-auto shrink-0 text-[12px] text-sub">{fileSize(f.size_bytes)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <ExpertSection />
      {product.membership_included && (
        <PricingCompare singleHref={buyHref} singlePrice={product.sale_price} productTitle={product.title} />
      )}
      <Faq items={product.faq.length ? product.faq : undefined} />

      {/* 구매 CTA */}
      <section className="pb-24 md:pb-28">
        <div className="container-x">
          <div className="rounded-[22px] bg-navy p-8 text-white md:p-12">
            <div className="grid items-center gap-8 md:grid-cols-[1.4fr_1fr]">
              <div>
                <div className="eyebrow">{product.title}</div>
                <div className="mt-3 text-[24px] md:text-[32px] font-bold leading-snug">질문 하나가 아닙니다.<br />마케팅 전략을 만드는 사고 구조입니다.</div>
              </div>
              <div className="flex flex-col gap-3">
                {owned ? (
                  <Link href={`/viewer/${product.slug}`} className="btn-gold py-4">지금 프롬프트 열기</Link>
                ) : (
                  <>
                    <Link href={buyHref} className="btn border border-white/25 py-4 text-white hover:bg-white/10">단품 구매 · {won(product.sale_price)}</Link>
                    {product.membership_included && <Link href="/checkout?plan=membership" className="btn-gold py-4">멤버십으로 이용 · 월 50,000원</Link>}
                  </>
                )}
              </div>
            </div>
            <div className="mt-8 [&>div]:bg-white/5 [&>div]:border-white/10 [&_.text-navy]:text-white [&_.text-sub]:text-white/60">
              <LicenseNotice compact />
            </div>
          </div>
        </div>
      </section>

      {owned ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 p-3 md:hidden">
          <Link href={`/viewer/${product.slug}`} className="btn-primary w-full">지금 프롬프트 열기</Link>
        </div>
      ) : (
        <StickyCta price={won(product.sale_price)} href={buyHref} />
      )}
    </>
  );
}
