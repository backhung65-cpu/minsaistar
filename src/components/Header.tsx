"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV = [
  { href: "/prompts", label: "프롬프트 스토어" },
  { href: "/membership", label: "멤버십" },
  { href: "/library", label: "라이브러리" },
  { href: "/my", label: "내 콘텐츠" },
];

const SUB: { match: string; title: string; links: { href: string; label: string }[] }[] = [
  { match: "/prompts", title: "프롬프트 스토어", links: [{ href: "/prompts", label: "전체" }, { href: "/membership", label: "멤버십 비교" }] },
  { match: "/membership", title: "MIRACLE MEMBERSHIP", links: [{ href: "/membership#pricing", label: "가격" }, { href: "/prompts", label: "포함 콘텐츠" }] },
  { match: "/library", title: "라이브러리", links: [{ href: "/library", label: "전체" }, { href: "/library#updated", label: "최근 업데이트" }] },
  { match: "/viewer", title: "Prompt Viewer", links: [{ href: "/my", label: "내 콘텐츠" }] },
  { match: "/my", title: "내 콘텐츠", links: [{ href: "/library", label: "라이브러리" }] },
];

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className={`text-[14px] font-semibold tracking-[0.02em] ${light ? "text-white" : "text-ink"}`}>
      MIRACLE PROMPT
    </span>
  );
}

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);
  if (pathname.startsWith("/admin")) return null;

  const sub = SUB.find((s) => pathname.startsWith(s.match)) ?? { title: "MIRACLE PROMPT", links: [{ href: "/prompts", label: "프롬프트" }, { href: "/membership", label: "멤버십" }] };

  return (
    <>
      {/* global-nav: 검은 44px 바 */}
      <header className="relative z-50 bg-black text-white">
        <div className="container-x flex h-11 items-center justify-between">
          <Link href="/" aria-label="MIRACLE PROMPT 홈" className="text-[12px] font-semibold tracking-[0.06em] text-white/90 hover:text-white">
            MIRACLE PROMPT
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className={`text-[12px] tracking-[-0.01em] transition-colors hover:text-white ${pathname.startsWith(n.href) ? "text-white" : "text-white/75"}`}>
                {n.label}
              </Link>
            ))}
            <Link href="/access" className="text-[12px] text-white/75 hover:text-white">구매자료 열기</Link>
          </nav>
          <button className="-mr-2 p-2 md:hidden" aria-label="메뉴" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.6">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 9h16M4 15h16" />}
            </svg>
          </button>
        </div>
        {open && (
          <nav className="border-t border-white/10 bg-black md:hidden">
            <div className="container-x flex flex-col py-4">
              {[...NAV, { href: "/access", label: "구매자료 열기" }].map((n) => (
                <Link key={n.href} href={n.href} className="py-3 text-[17px] font-semibold text-white/90">{n.label}</Link>
              ))}
            </div>
          </nav>
        )}
      </header>

      {/* sub-nav-frosted: 반투명 블러 52px, 스크롤 시 고정 (홈에서는 숨김) */}
      {pathname !== "/" && (
      <div className="frosted sticky top-0 z-40 border-b border-black/[0.08]">
        <div className="container-x flex h-[52px] items-center justify-between gap-4">
          <span className="truncate text-[19px] font-semibold tracking-[-0.01em] text-ink md:text-[21px]">{sub.title}</span>
          <div className="flex shrink-0 items-center gap-5">
            {sub.links.map((l) => (
              <Link key={l.href} href={l.href} className="hidden text-[12px] text-ink/80 hover:text-ink sm:inline">{l.label}</Link>
            ))}
            <Link href="/checkout?plan=membership" className="btn-primary btn-sm !px-3 !py-1 !text-[12px]">멤버십 시작</Link>
          </div>
        </div>
      </div>
      )}
    </>
  );
}
