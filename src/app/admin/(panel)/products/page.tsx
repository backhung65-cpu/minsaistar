import Link from "next/link";
import { listCategories, listProducts } from "@/lib/repo";
import { STATUS_LABEL, won } from "@/lib/format";
import { seedSampleAction } from "../actions";
import { GptImport } from "@/components/admin/GptImport";

export default async function AdminProducts() {
  const [products, categories] = await Promise.all([listProducts(), listCategories()]);
  const catName = new Map(categories.map((c) => [c.id, c.name]));
  const hasSample = products.some((p) => p.slug === "marketing-master");
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[24px] font-semibold text-ink">상품 관리</h1>
        <div className="flex gap-2">
          {!hasSample && <form action={seedSampleAction}><button className="btn-outline btn-sm">샘플 상품 등록</button></form>}
          <Link href="/admin/products/new" className="btn-primary btn-sm">+ 새 상품 등록</Link>
        </div>
      </div>
      <GptImport />
      <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full min-w-[720px] text-left text-[13.5px]">
          <thead className="bg-parchment text-[12px] text-sub"><tr><th className="px-4 py-3">상품명</th><th>카테고리</th><th>유형</th><th>판매가</th><th>멤버십</th><th>버전</th><th>상태</th><th></th></tr></thead>
          <tbody className="divide-y divide-line">
            {products.map((p) => (
              <tr key={p.id} className={p.status === "ARCHIVED" ? "opacity-50" : ""}>
                <td className="px-4 py-3">
                  <Link href={`/admin/products/${p.id}`} className="font-semibold text-ink hover:underline">{p.title}</Link>
                  <div className="font-mono text-[11.5px] text-sub">/prompts/{p.slug}</div>
                </td>
                <td>{catName.get(p.category_id ?? "") ?? "-"}</td>
                <td>{p.product_type}</td>
                <td>{won(p.sale_price)}</td>
                <td>{p.membership_included ? <span className="badge bg-tile text-white">ON</span> : <span className="badge bg-parchment text-sub">OFF</span>}</td>
                <td className="font-mono">v{p.version}</td>
                <td>{STATUS_LABEL[p.status]}</td>
                <td className="pr-4 text-right"><Link href={`/admin/products/${p.id}`} className="btn-outline btn-sm">편집</Link></td>
              </tr>
            ))}
            {products.length === 0 && <tr><td colSpan={8} className="p-10 text-center text-sub">등록된 상품이 없습니다.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
