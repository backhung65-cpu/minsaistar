import Link from "next/link";
import type { Product } from "@/lib/types";
import { won } from "@/lib/format";
import { Badges } from "./Badges";
import { ProductThumb } from "./ProductThumb";

export function ProductCard({ product, categoryName }: { product: Product; categoryName?: string }) {
  const badges = [...product.badges];
  if (product.membership_included && !badges.includes("MEMBERSHIP")) badges.push("MEMBERSHIP");
  return (
    <Link
      href={`/prompts/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-[22px] border border-line bg-white transition hover:-translate-y-0.5 hover:border-navy/30"
    >
      <ProductThumb product={product} categoryName={categoryName} />
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[12px] font-bold tracking-[0.18em] text-sub">{categoryName?.toUpperCase() ?? "PROMPT"}</span>
          <Badges badges={badges.filter((b) => b !== "MEMBERSHIP")} />
        </div>
        <h3 className="mt-3 text-[19px] font-bold leading-snug text-navy">{product.title}</h3>
        <p className="mt-2 flex-1 text-[14.5px] leading-relaxed text-sub line-clamp-2">{product.short_description}</p>
        <div className="mt-5 flex items-end justify-between border-t border-line pt-4">
          <div>
            {product.badges.includes("FREE") ? (
              <div className="text-[20px] font-extrabold text-navy">FREE</div>
            ) : (
              <>
                {product.regular_price > product.sale_price && (
                  <div className="text-[12px] text-sub line-through">{won(product.regular_price)}</div>
                )}
                <div className="text-[20px] font-extrabold text-navy">{won(product.sale_price)}</div>
              </>
            )}
            {product.membership_included && <div className="mt-0.5 text-[12px] font-semibold text-gold-2">멤버십 포함</div>}
          </div>
          <span className="text-[13px] font-bold text-navy group-hover:underline">자세히 보기 →</span>
        </div>
      </div>
    </Link>
  );
}
