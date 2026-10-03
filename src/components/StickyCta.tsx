"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

/** floating-sticky-bar: 모바일 하단 반투명 고정 바. 가격 비교 구간(#pricing)에서는 멤버십 CTA로 전환 */
export function StickyCta({ price, href, label = "구매하기" }: { price?: string; href?: string; label?: string }) {
  const [membership, setMembership] = useState(!href);
  useEffect(() => {
    if (!href) return;
    const el = document.getElementById("pricing");
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setMembership(e.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, [href]);

  return (
    <div className="frosted fixed inset-x-0 bottom-0 z-40 border-t border-black/[0.08] px-5 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] md:hidden">
      <div className="flex min-h-10 items-center justify-between gap-3">
        {membership || !href ? (
          <>
            <div className="leading-tight">
              <div className="text-[12px] text-sub">MIRACLE MEMBERSHIP</div>
              <div className="text-[17px] font-semibold text-ink">월 50,000원</div>
            </div>
            <Link href="/checkout?plan=membership" className="btn-primary">멤버십 시작</Link>
          </>
        ) : (
          <>
            <div className="text-[17px] font-semibold text-ink">{price}</div>
            <Link href={href} className="btn-primary">{label}</Link>
          </>
        )}
      </div>
    </div>
  );
}
