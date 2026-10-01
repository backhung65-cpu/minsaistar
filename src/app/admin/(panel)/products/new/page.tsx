import Link from "next/link";
import { listCategories, listProducts } from "@/lib/repo";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function NewProduct() {
  const [categories, products] = await Promise.all([listCategories(), listProducts()]);
  return (
    <div className="max-w-5xl">
      <Link href="/admin/products" className="text-[13px] text-sub">← 상품 관리</Link>
      <h1 className="mt-2 text-[24px] font-extrabold text-navy">새 상품 등록</h1>
      <p className="mt-1 text-[13.5px] text-sub">저장 후 파일을 업로드할 수 있습니다. PUBLISHED로 저장하면 스토어와 멤버십 라이브러리에 즉시 노출됩니다.</p>
      <div className="mt-6"><ProductForm categories={categories} others={products} /></div>
    </div>
  );
}
