import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getProductBySlug, listProductFiles } from "@/lib/repo";
import { getSession, isAdmin } from "@/lib/session";
import { canAccess, getAccess } from "@/lib/access";
import { fileSize } from "@/lib/format";
import { CopyButton } from "@/components/CopyButton";
import { LicenseNotice } from "@/components/Sections";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Prompt Viewer", robots: { index: false } };

export default async function Viewer({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || product.status === "ARCHIVED") notFound();
  const session = await getSession();
  const access = await getAccess(session);
  const admin = await isAdmin();
  const viaMembership = !access.ownedProductIds.has(product.id) && access.membershipActive;
  if (!admin && !canAccess(access, product)) redirect(session ? `/prompts/${product.slug}` : `/access?next=/viewer/${product.slug}`);

  const files = await listProductFiles(product.id);
  const isGpt = product.product_type === "GPT";
  const hasPrompt = product.product_type !== "FILE" && !isGpt && Boolean(product.prompt_content);
  const full = [product.prompt_content, product.input_template].filter(Boolean).join("\n\n");
  const copyCls = "btn-sm btn border border-accent-dark text-accent-dark";

  return (
    <div className="pb-20">
      <section className="border-b border-line bg-white">
        <div className="container-x flex flex-col gap-4 py-8 md:flex-row md:items-end md:justify-between md:py-12">
          <div>
            <div className="eyebrow">MIRACLE PROMPT</div>
            <h1 className="mt-3 text-[28px] md:text-[36px] font-semibold tracking-tight text-ink">{product.title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-[13px]">
              <span className="badge bg-parchment text-ink-80">{viaMembership ? "MEMBERSHIP 이용 중" : "구매 완료 콘텐츠"}</span>
              <span className="badge bg-parchment text-ink">VERSION {product.version}</span>
            </div>
          </div>
          <div className="flex gap-2">
            {viaMembership && <Link href="/library" className="btn-outline btn-sm">← 라이브러리</Link>}
            <Link href="/my" className="btn-outline btn-sm">내 콘텐츠</Link>
          </div>
        </div>
      </section>

      <div className="container-x mt-10 grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-8">
          {isGpt && (
            <section className="rounded-[18px] bg-tile p-6 text-white md:p-10">
              <div className="text-[14px] font-semibold text-muted-dark">GPT 솔루션</div>
              <p className="mt-3 text-[19px] leading-[1.45] md:text-[21px]">{product.short_description}</p>
              {product.output && (
                <p className="mt-4 text-[15px] text-muted-dark"><span className="font-semibold text-white">만들 수 있는 결과물</span> · {product.output}</p>
              )}
              <div className="mt-8 flex flex-wrap gap-3">
                {product.gpt_url ? (
                  <a href={product.gpt_url} target="_blank" rel="noopener noreferrer" className="btn-primary">GPT 바로가기 ↗</a>
                ) : (
                  <span className="text-[14px] text-muted-dark">GPT 주소가 아직 등록되지 않았습니다.</span>
                )}
                {product.guide_url && (
                  <a href={product.guide_url} target="_blank" rel="noopener noreferrer" className="btn border border-accent-dark text-accent-dark">설명 · 영상 보기 ↗</a>
                )}
              </div>
              <p className="mt-6 text-[12px] text-muted-dark">GPT 실행에는 ChatGPT 로그인이 필요합니다. 설명·영상은 커뮤니티 회원 공간에서 열립니다. 링크는 회원 본인만 사용할 수 있습니다.</p>
            </section>
          )}
          {hasPrompt && (
            <>
              {/* 사용 방법 */}
              <ol className="grid gap-3 sm:grid-cols-3">
                {[
                  ["프롬프트를 복사합니다.", "아래 [전체 복사하기] 버튼을 누르세요."],
                  ["ChatGPT / Claude / Gemini에 붙여 넣습니다.", "새 대화창에서 시작하세요."],
                  ["프롬프트가 요청하는 정보를 입력합니다.", "입력 템플릿을 활용하세요."],
                ].map(([t, d], i) => (
                  <li key={t} className="rounded-2xl border border-line bg-white p-5">
                    <div className="text-[14px] font-semibold text-sub">Step {i + 1}</div>
                    <div className="mt-2 text-[15px] font-semibold text-ink">{t}</div>
                    <div className="mt-1 text-[13px] text-sub">{d}</div>
                  </li>
                ))}
              </ol>

              {/* 프롬프트 본문 */}
              <div className="prompt-box overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4 md:px-7">
                  <span className="text-[12px] font-semibold text-muted-dark">{product.title}</span>
                  <div className="flex flex-wrap gap-2 font-sans">
                    <CopyButton text={product.prompt_content} label="시스템 프롬프트" className={copyCls} doneLabel="✓ 복사됨" />
                    {product.input_template && <CopyButton text={product.input_template} label="입력 템플릿" className={copyCls} doneLabel="✓ 복사됨" />}
                    {product.usage_example && <CopyButton text={product.usage_example} label="사용 예제" className={copyCls} doneLabel="✓ 복사됨" />}
                  </div>
                </div>
                <pre className="max-h-[70vh] overflow-auto whitespace-pre-wrap px-5 py-6 md:px-7">{product.prompt_content}</pre>
                <div className="border-t border-white/10 px-5 py-5 text-center md:px-7 font-sans">
                  <CopyButton text={full} label="전체 복사하기" doneLabel="✓ 프롬프트가 복사되었습니다." className="btn-gold w-full max-w-sm text-[16px]" />
                </div>
              </div>

              {product.input_template && (
                <Block title="입력 템플릿" copy={product.input_template}>{product.input_template}</Block>
              )}
              {product.usage_example && (
                <Block title="입력 예제" copy={product.usage_example}>{product.usage_example}</Block>
              )}
              {product.result_example && <Block title="결과 예제">{product.result_example}</Block>}
              {product.usage_guide && <Block title="사용 방법">{product.usage_guide}</Block>}
            </>
          )}
          {!hasPrompt && !isGpt && product.description && <Block title="콘텐츠 소개">{product.description}</Block>}
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          {(!isGpt || files.length > 0) && (
          <div id="files" className="card scroll-mt-24 !p-6">
            <div className="text-[15px] font-semibold text-ink">자료 다운로드</div>
            {files.length ? (
              <ul className="mt-4 space-y-2">
                {files.map((f) => (
                  <li key={f.id}>
                    <a href={`/api/download/${f.id}`} className="flex items-center gap-3 rounded-xl border border-line px-4 py-3 text-[14px] hover:border-ink">
                      <span className="badge bg-parchment text-ink-80">{f.file_type}</span>
                      <span className="min-w-0 flex-1 truncate">{f.file_name}</span>
                      <span className="shrink-0 text-[12px] text-sub">{fileSize(f.size_bytes)} ↓</span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-[13.5px] text-sub">이 콘텐츠에는 첨부 파일이 없습니다.</p>
            )}
            <p className="mt-4 text-[12px] text-sub">다운로드 링크는 권한 확인 후 일시적으로 생성됩니다.</p>
          </div>
          )}

          {product.changelog.length > 0 && (
            <div className="card !p-6">
              <div className="text-[15px] font-semibold text-ink">업데이트 이력</div>
              <ol className="mt-4 space-y-4">
                {product.changelog.map((c) => (
                  <li key={c.version + c.date} className="border-l-2 border-accent pl-4">
                    <div className="text-[13px] text-sub">{c.date}</div>
                    <div className="font-semibold text-ink">v{c.version}</div>
                    <ul className="mt-1 text-[13.5px] text-sub">{c.notes.map((n) => <li key={n}>- {n}</li>)}</ul>
                  </li>
                ))}
              </ol>
            </div>
          )}
          <LicenseNotice compact />
        </aside>
      </div>
    </div>
  );
}

function Block({ title, copy, children }: { title: string; copy?: string; children: string }) {
  return (
    <section className="card">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[17px] font-semibold text-ink">{title}</h2>
        {copy && <CopyButton text={copy} label="복사" className="btn-outline btn-sm" doneLabel="✓ 복사됨" />}
      </div>
      <pre className="mt-4 whitespace-pre-wrap font-sans text-[15px] leading-[1.8] text-ink">{children}</pre>
    </section>
  );
}
