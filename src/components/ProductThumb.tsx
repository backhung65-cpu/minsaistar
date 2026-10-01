import type { Product } from "@/lib/types";

/** 썸네일이 없으면 '책 표지' 형태의 타이포그래피 썸네일을 생성 */
export function ProductThumb({ product, categoryName, className = "" }: { product: Product; categoryName?: string; className?: string }) {
  if (product.thumbnail) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={product.thumbnail} alt={product.title} className={`aspect-[4/3] w-full object-cover ${className}`} />;
  }
  return (
    <div className={`relative aspect-[4/3] w-full overflow-hidden bg-navy ${className}`}>
      <div className="absolute inset-y-0 left-[8%] w-px bg-gold/40" />
      <div className="absolute inset-0 flex flex-col justify-between p-[9%] pl-[14%]">
        <div className="text-[10px] font-bold tracking-[0.3em] text-gold">MIRACLE PROMPT · {categoryName ?? "PROMPT"}</div>
        <div>
          <div className="text-[19px] md:text-[21px] font-bold leading-snug text-white">{product.title}</div>
          <div className="mt-3 text-[10px] tracking-[0.24em] text-white/50">VERSION {product.version}</div>
        </div>
      </div>
    </div>
  );
}
