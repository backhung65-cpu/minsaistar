import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct, listCategories, listProductFiles, listProducts } from "@/lib/repo";
import { fileSize, fmtDate } from "@/lib/format";
import { ProductForm } from "@/components/admin/ProductForm";
import { FileUploader } from "@/components/admin/FileManager";
import { archiveProductAction, deleteFileAction } from "../../actions";

export default async function EditProduct({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> }) {
  const { id } = await params;
  const { created } = await searchParams;
  const product = await getProduct(id);
  if (!product) notFound();
  const [categories, products, files] = await Promise.all([listCategories(), listProducts(), listProductFiles(id)]);

  return (
    <div className="max-w-5xl">
      <Link href="/admin/products" className="text-[13px] text-sub">← 상품 관리</Link>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[24px] font-semibold text-ink">{product.title}</h1>
        <form action={archiveProductAction}>
          <input type="hidden" name="id" value={product.id} />
          <button className="text-[13px] text-red-700 underline">보관(ARCHIVED) 처리</button>
        </form>
      </div>
      {created && <p className="mt-3 rounded-xl bg-emerald-50 px-4 py-3 text-[14px] text-emerald-700">✓ 상품이 등록되었습니다. 아래에서 자료 파일을 업로드하세요.</p>}

      <section className="card mt-6 space-y-4 !p-6">
        <h2 className="text-[16px] font-semibold text-ink">파일 (ZIP · PDF · MD · TXT)</h2>
        <p className="text-[12.5px] text-sub">파일은 비공개 저장소에 저장되며, 구매권한이 확인된 사용자에게만 임시 다운로드 URL로 제공됩니다.</p>
        <ul className="divide-y divide-line rounded-xl border border-line">
          {files.map((f) => (
            <li key={f.id} className="flex items-center gap-3 px-4 py-3 text-[14px]">
              <span className="badge bg-parchment text-ink-80">{f.file_type}</span>
              <span className="min-w-0 flex-1 truncate">{f.file_name}</span>
              <span className="text-[12px] text-sub">{fileSize(f.size_bytes)} · {fmtDate(f.created_at)}</span>
              <a href={`/api/download/${f.id}`} className="text-[12.5px] underline">받기</a>
              <form action={deleteFileAction}><input type="hidden" name="id" value={f.id} /><button className="text-[12.5px] text-red-700 underline">삭제</button></form>
            </li>
          ))}
          {files.length === 0 && <li className="px-4 py-6 text-center text-[13px] text-sub">업로드된 파일이 없습니다.</li>}
        </ul>
        <FileUploader productId={product.id} />
      </section>

      <div className="mt-6">
        <ProductForm product={product} categories={categories} others={products.filter((p) => p.id !== product.id)} />
      </div>
    </div>
  );
}
