import Link from "next/link";
import type { Product } from "@/lib/types";
import { won } from "@/lib/format";
import { Badges } from "./Badges";
import { ProductThumb } from "./ProductThumb";

/** store-utility-card: 흰 배경, 헤어라인, 18px, 그림자 없음 */
export function ProductCard({ product, categoryName }: { product: Product; categoryName?: string }) {
  return (
    <Link href={`/prompts/${product.slug}`} className="group flex flex-col overflow-hidden rounded-[18px] border border-hairline bg-canvas">
      <div className="p-3 pb-0">
        <ProductThumb product={product} categoryName={categoryName} className="rounded-[8px]" />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[12px] text-sub">{categoryName ?? "PROMPT"}</span>
          <Badges badges={product.badges.filter((b) => b !== "MEMBERSHIP")} />
        </div>
        <h3 className="mt-2 text-[17px] font-semibold leading-[1.24] text-ink">{product.title}</h3>
        <p className="mt-1 flex-1 text-[14px] leading-[1.43] text-sub line-clamp-2">{product.short_description}</p>
        <div className="mt-5">
          {product.product_type === "GPT" ? (
            <div className="text-[17px] text-ink">멤버십 전용</div>
          ) : product.badges.includes("FREE") ? (
            <div className="text-[17px] text-ink">무료</div>
          ) : (
            <div className="text-[17px] text-ink">
              {won(product.sale_price)}
              {product.regular_price > product.sale_price && <span className="ml-2 text-[14px] text-sub line-through">{won(product.regular_price)}</span>}
            </div>
          )}
          {product.product_type === "GPT" ? (
            <div className="line-clamp-1 text-[14px] text-sub">{product.output || "GPT 솔루션"}</div>
          ) : product.membership_included && <div className="text-[14px] text-sub">또는 멤버십에 포함</div>}
          <span className="mt-3 inline-block text-[17px] text-accent group-hover:underline">자세히 보기 ›</span>
        </div>
      </div>
    </Link>
  );
}
