"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

/** 모바일 하단 고정 구매 영역. 가격 비교 구간(#pricing)에서는 멤버십 CTA로 전환 */
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
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 px-4 py-3 backdrop-blur md:hidden pb-[max(12px,env(safe-area-inset-bottom))]">
      {membership || !href ? (
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-bold tracking-[0.18em] text-gold-2">MIRACLE</div>
            <div className="text-[17px] font-extrabold text-navy">월 50,000원</div>
          </div>
          <Link href="/checkout?plan=membership" className="btn-primary px-6">멤버십 시작</Link>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3">
          <div className="text-[19px] font-extrabold text-navy">{price}</div>
          <Link href={href} className="btn-primary px-8">{label}</Link>
        </div>
      )}
    </div>
  );
}
