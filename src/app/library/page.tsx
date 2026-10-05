import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { listAllFiles, listCategories, listProducts } from "@/lib/repo";
import { getSession } from "@/lib/session";
import { getAccess } from "@/lib/access";
import { fmtDate } from "@/lib/format";
import { LibraryBrowser, type LibraryItem } from "./LibraryBrowser";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "MEMBERSHIP LIBRARY", robots: { index: false } };

const RECENT = 30 * 86_400_000;

export default async function Library() {
  const session = await getSession();
  const access = await getAccess(session);
  if (!access.membershipActive) redirect(session ? "/membership" : "/access?next=/library");

  const [products, categories, files] = await Promise.all([listProducts({ publishedOnly: true }), listCategories(), listAllFiles()]);
  const catById = new Map(categories.map((c) => [c.id, c]));
  const now = Date.now();
  const items: LibraryItem[] = products
    .filter((p) => p.membership_included)
    .map((p) => {
      const fileTypes = [...new Set(files.filter((f) => f.product_id === p.id).map((f) => f.file_type.toUpperCase()))];
      return {
        id: p.id, slug: p.slug, title: p.title, short: p.short_description, version: p.version,
        category: p.category_id ? catById.get(p.category_id)?.slug ?? "" : "",
        categoryName: p.category_id ? catById.get(p.category_id)?.name ?? "" : "",
        hasPrompt: p.product_type !== "FILE" && Boolean(p.prompt_content),
        hasTemplate: Boolean(p.input_template) || fileTypes.includes("TEMPLATE"),
        fileTypes,
        isNew: p.badges.includes("NEW") || now - new Date(p.created_at).getTime() < RECENT,
        isUpdated: p.badges.includes("UPDATED") || (p.version !== "1.0" && now - new Date(p.updated_at).getTime() < RECENT),
        updatedAt: fmtDate(p.updated_at),
      };
    });

  return (
    <>
      <section className="bg-tile text-white">
        <div className="container-x py-12 md:py-16">
          <div className="eyebrow !text-muted-dark">MIRACLE MEMBERSHIP</div>
          <h1 className="mt-3 text-[28px] md:text-[40px] font-semibold tracking-tight">민진홍의 마케팅 프롬프트 라이브러리</h1>
          <div className="mt-8 flex flex-wrap items-end gap-x-10 gap-y-4">
            <div>
              <div className="text-[14px] text-muted-dark">현재 이용 가능한 콘텐츠</div>
              <div className="text-[44px] font-semibold leading-none tracking-[-0.02em] text-white">{items.length}</div>
            </div>
            <div className="text-[14px] text-muted-dark">멤버십 이용 기간 · {fmtDate(access.membership?.expired_at)}까지</div>
          </div>
        </div>
      </section>
      <LibraryBrowser items={items} categories={categories.map((c) => ({ slug: c.slug, name: c.name }))} />
    </>
  );
}
