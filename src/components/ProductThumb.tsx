import type { Product } from "@/lib/types";

/** 썸네일이 없으면 다크 타일 위 타이포그래피 썸네일을 생성 */
export function ProductThumb({ product, categoryName, className = "" }: { product: Product; categoryName?: string; className?: string }) {
  if (product.thumbnail) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={product.thumbnail} alt={product.title} className={`aspect-[4/3] w-full object-cover ${className}`} />;
  }
  return (
    <div className={`relative flex aspect-[4/3] w-full flex-col items-center justify-center overflow-hidden bg-tile px-[10%] text-center ${className}`}>
      <div className="text-[12px] font-semibold text-muted-dark">{categoryName ?? "PROMPT"}</div>
      <div className="mt-2 text-balance text-[24px] font-semibold leading-[1.15] tracking-[-0.02em] text-white md:text-[28px]">{product.title}</div>
      <div className="mt-3 text-[12px] text-muted-dark">Version {product.version}</div>
    </div>
  );
}
