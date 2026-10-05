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
import { Deliverables, ExpertSection, Faq, LicenseNotice, PricingCompare, PromptPreview, SectionHead, Tile } from "@/components/Sections";

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
  const isGpt = product.product_type === "GPT";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.short_description,
    image: product.thumbnail || undefined,
    brand: { "@type": "Brand", name: "MIRACLE PROMPT" },
    offers: product.product_type === "GPT" ? undefined : { "@type": "Offer", price: product.sale_price, priceCurrency: "KRW", availability: "https://schema.org/InStock", url: `${siteUrl}/prompts/${product.slug}` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {product.status !== "PUBLISHED" && (
        <div className="bg-ink py-2 text-center text-[12px] text-white">관리자 미리보기 · 현재 상태: {product.status}</div>
      )}

      {/* 구매 영역 — 상품 이미지 + 옵션 카드 */}
      <section className="bg-canvas">
        <div className="container-x grid gap-10 py-10 md:py-14 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
          <div className="self-start rounded-[18px] bg-parchment p-6 md:p-12">
            <ProductThumb product={product} categoryName={category?.name} className="rounded-[8px] product-shadow" />
          </div>
          <div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-2 text-[14px] text-sub">
              <Link href={category ? `/prompts?category=${category.slug}` : "/prompts"} className="link">{category?.name ?? "프롬프트"}</Link>
              <span aria-hidden>·</span>
              <span>{PRODUCT_TYPE_LABEL[product.product_type]} · Version {product.version}</span>
            </div>
            <h1 className="mt-2 text-balance text-[34px] font-semibold leading-[1.1] tracking-[-0.02em] text-ink md:text-[40px]">{product.title}</h1>
            <p className="mt-3 text-[19px] leading-[1.4] text-ink-80">{product.short_description}</p>
            <div className="mt-3"><Badges badges={product.badges} /></div>
            {product.output && (
              <p className="mt-4 text-[14px] text-sub"><span className="font-semibold text-ink">만들 수 있는 결과물</span> · {product.output}</p>
            )}

            {owned ? (
              <div className="mt-8 rounded-[18px] border border-hairline p-6">
                <div className="text-[17px] font-semibold text-ink">이용 가능한 콘텐츠입니다.</div>
                <p className="mt-1 text-[14px] text-sub">프롬프트를 열고 바로 복사하세요.</p>
                <Link href={`/viewer/${product.slug}`} className="btn-primary mt-5 w-full">지금 프롬프트 열기</Link>
              </div>
            ) : isGpt ? (
              <div className="mt-8 rounded-[18px] border-2 border-accent-focus p-6">
                <div className="flex items-center gap-2 text-[17px] font-semibold text-ink">미라클 멤버십 전용 <span className="badge bg-accent text-white">GPT</span></div>
                <p className="mt-1 text-[14px] text-sub">멤버십 회원은 이 GPT를 바로 실행하고, 사용 설명과 영상을 볼 수 있습니다. 다른 GPT 솔루션과 프롬프트도 모두 포함됩니다.</p>
                <div className="mt-4 text-[17px] text-ink">월 55,000원</div>
                <Link href="/checkout?plan=membership" className="btn-primary mt-4 w-full">멤버십으로 이용</Link>
                <Link href="/access" className="mt-3 block text-center text-[14px] link">이미 회원이신가요? 구매자료 열기 ›</Link>
              </div>
            ) : (
              <div className="mt-8">
                <div className="text-[17px] font-semibold text-ink">구매 방법을 선택하세요.</div>
                <div className="mt-3 grid gap-3">
                  <Link href={buyHref} className="flex items-center justify-between gap-4 rounded-[18px] border border-hairline bg-canvas px-5 py-4 hover:border-ink/40">
                    <span>
                      <span className="block text-[17px] font-semibold text-ink">단품 구매</span>
                      <span className="block text-[14px] text-sub">이 프롬프트와 부가자료 · 평생 이용</span>
                    </span>
                    <span className="shrink-0 text-right text-[17px] text-ink">
                      {product.regular_price > product.sale_price && <span className="mr-2 text-[14px] text-sub line-through">{won(product.regular_price)}</span>}
                      {won(product.sale_price)}
                    </span>
                  </Link>
                  {product.membership_included && (
                    <Link href="/checkout?plan=membership" className="flex items-center justify-between gap-4 rounded-[18px] border-2 border-accent-focus bg-canvas px-5 py-4">
                      <span>
                        <span className="flex items-center gap-2 text-[17px] font-semibold text-ink">미라클 멤버십 <span className="badge bg-accent text-white">추천</span></span>
                        <span className="block text-[14px] text-sub">이 프롬프트 포함 모든 자료 · 언제든 해지</span>
                      </span>
                      <span className="shrink-0 text-[17px] text-ink">월 55,000원</span>
                    </Link>
                  )}
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  {product.membership_included && <Link href="/checkout?plan=membership" className="btn-primary">멤버십으로 이용</Link>}
                  <Link href={buyHref} className="btn-outline">단품 구매</Link>
                </div>
              </div>
            )}
            <div className="mt-8 flex items-center justify-between border-t border-hairline pt-5">
              <span className="text-[14px] text-sub">공유하기</span>
              <ShareButtons url={`${siteUrl}/prompts/${product.slug}`} title={product.title} />
            </div>
          </div>
        </div>
      </section>

      {/* 상품 소개 */}
      <Tile tone="parchment">
        <div className="container-x max-w-[820px] text-center">
          <h2 className="h2 text-balance text-ink">{isGpt ? <>질문에 답하면<br />결과물이 완성됩니다.</> : <>질문 하나가 아닙니다.<br />마케팅 전략을 만드는 사고 구조입니다.</>}</h2>
          <div className="mt-6 whitespace-pre-line text-left text-[17px] leading-[1.6] text-ink-80 md:text-center">{product.description}</div>
        </div>
      </Tile>

      {/* 해결하는 문제 + 활용 분야 */}
      {(product.problems.length > 0 || product.use_cases.length > 0) && (
        <Tile tone="light">
          <div className="container-x grid gap-5 md:grid-cols-2">
            {product.problems.length > 0 && (
              <div className="rounded-[18px] bg-parchment p-8">
                <h3 className="h3 text-ink">이런 문제를 해결합니다.</h3>
                <ul className="mt-5 space-y-3 text-[17px] text-ink-80">
                  {product.problems.map((t) => <li key={t}>{t}</li>)}
                </ul>
              </div>
            )}
            {product.use_cases.length > 0 && (
              <div className="rounded-[18px] bg-parchment p-8">
                <h3 className="h3 text-ink">이렇게 활용합니다.</h3>
                <div className="mt-5 flex flex-wrap gap-2">
                  {product.use_cases.map((t) => <span key={t} className="rounded-full border border-hairline bg-canvas px-4 py-2 text-[14px] text-ink">{t}</span>)}
                </div>
              </div>
            )}
          </div>
        </Tile>
      )}

      {/* 결과 예시 */}
      {product.result_example && (
        <Tile tone="parchment">
          <div className="container-x">
            <SectionHead eyebrow="결과 예시" title="이 프롬프트로 만들어지는 결과." desc="실제 입력 예시로 생성한 결과의 일부입니다." />
            <div className="mt-12 grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
              {product.usage_example && (
                <div className="card">
                  <div className="text-[14px] font-semibold text-sub">입력</div>
                  <pre className="mt-3 whitespace-pre-wrap font-sans text-[14px] leading-[1.6] text-ink">{product.usage_example}</pre>
                </div>
              )}
              <div className="card relative overflow-hidden">
                <div className="text-[14px] font-semibold text-sub">출력</div>
                <pre className="mt-3 max-h-[520px] overflow-hidden whitespace-pre-wrap font-sans text-[14px] leading-[1.6] text-ink">{product.result_example}</pre>
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent" />
              </div>
            </div>
          </div>
        </Tile>
      )}

      {/* 프롬프트 미리보기 */}
      {product.preview_content && (
        <Tile tone="dark">
          <div className="container-x">
            <SectionHead dark eyebrow="미리보기" title="프롬프트 미리보기." desc="판매 전에는 전체 원문을 공개하지 않습니다. 구조와 흐름을 먼저 확인하세요." />
            <div className="mx-auto mt-12 max-w-3xl">
              <PromptPreview content={product.preview_content} title={product.title} />
            </div>
          </div>
        </Tile>
      )}

      {/* 사용 방법 */}
      {product.usage_guide && (
        <Tile tone="light">
          <div className="container-x">
            <SectionHead eyebrow="사용 방법" title="복사하고, 붙여 넣고, 입력하세요." />
            <ol className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {product.usage_guide.split("\n").filter(Boolean).map((line, i) => (
                <li key={i} className="rounded-[18px] bg-parchment p-6">
                  <div className="text-[14px] font-semibold text-sub">Step {i + 1}</div>
                  <div className="mt-2 text-[17px] leading-[1.45] text-ink">{line.replace(/^STEP\s*\d+\.?\s*/i, "")}</div>
                </li>
              ))}
            </ol>
          </div>
        </Tile>
      )}

      {/* 패키지 구성 */}
      {packageItems.length > 0 && (
        <Tile tone="parchment">
          <div className="container-x max-w-[820px]">
            <SectionHead title="패키지 구성." />
            <ul className="mt-8 border-t border-hairline">
              {packageItems.map((p) => (
                <li key={p.id} className="flex items-center justify-between border-b border-hairline py-4">
                  <Link href={`/prompts/${p.slug}`} className="link">{p.title}</Link>
                  <span className="text-[14px] text-sub">{won(p.sale_price)}</span>
                </li>
              ))}
            </ul>
          </div>
        </Tile>
      )}

      {/* 제공 자료 (GPT 솔루션은 이용 방법으로 대체) */}
      {isGpt ? (
        <Tile tone="parchment">
          <div className="container-x">
            <SectionHead eyebrow="이용 방법" title="설명을 보고, GPT를 실행하세요." />
            <ol className="mx-auto mt-12 grid max-w-4xl gap-4 md:grid-cols-3">
              {[
                ["목적 선택", "카테고리와 검색으로 필요한 솔루션을 찾습니다."],
                ["설명 · 영상 확인", "사용 방법과 결과물 예시를 먼저 확인합니다."],
                ["GPT 실행", "GPT에서 질문에 답하며 결과물을 완성합니다."],
              ].map(([t, d], i) => (
                <li key={t} className="card">
                  <div className="text-[14px] font-semibold text-sub">Step {i + 1}</div>
                  <div className="mt-2 text-[17px] font-semibold text-ink">{t}</div>
                  <div className="mt-1 text-[14px] text-sub">{d}</div>
                </li>
              ))}
            </ol>
          </div>
        </Tile>
      ) : (
        <Deliverables tone="parchment" />
      )}
      {files.length > 0 && (
        <div className="bg-parchment pb-16">
          <div className="container-x max-w-4xl">
            <div className="card">
              <div className="text-[17px] font-semibold text-ink">포함 파일</div>
              <ul className="mt-3 border-t border-hairline">
                {files.map((f) => (
                  <li key={f.id} className="flex items-center gap-3 border-b border-hairline py-3 text-[14px] last:border-0">
                    <span className="badge bg-parchment text-ink-80">{f.file_type}</span>
                    <span className="truncate text-ink">{f.file_name}</span>
                    <span className="ml-auto shrink-0 text-[12px] text-sub">{fileSize(f.size_bytes)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <ExpertSection tone="light" />
      {product.membership_included && !isGpt && (
        <PricingCompare tone="parchment" singleHref={buyHref} singlePrice={product.sale_price} productTitle={product.title} />
      )}
      <Faq tone="light" items={product.faq.length ? product.faq : undefined} />

      {/* 구매 CTA */}
      <Tile tone="dark">
        <div className="container-x text-center">
          <div className="eyebrow !text-muted-dark">{product.title}</div>
          <h2 className="h2 mt-2 text-balance text-white">지금 바로 사용해 보세요.</h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {owned ? (
              <Link href={`/viewer/${product.slug}`} className="btn-primary">지금 프롬프트 열기</Link>
            ) : (
              <>
                {product.membership_included && <Link href="/checkout?plan=membership" className="btn-primary">멤버십으로 이용 · 월 55,000원</Link>}
                {!isGpt && <Link href={buyHref} className="btn border border-accent-dark text-accent-dark">단품 구매 · {won(product.sale_price)}</Link>}
              </>
            )}
          </div>
          <div className="mx-auto mt-10 max-w-3xl text-left"><LicenseNotice compact dark /></div>
        </div>
      </Tile>

      {owned ? (
        <div className="frosted fixed inset-x-0 bottom-0 z-40 border-t border-black/[0.08] px-5 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] md:hidden">
          <Link href={`/viewer/${product.slug}`} className="btn-primary w-full">지금 프롬프트 열기</Link>
        </div>
      ) : (
        <StickyCta price={won(product.sale_price)} href={isGpt ? undefined : buyHref} />
      )}
    </>
  );
}
