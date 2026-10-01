"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV = [
  { href: "/prompts", label: "PROMPT STORE" },
  { href: "/membership", label: "MEMBERSHIP" },
  { href: "/library", label: "LIBRARY" },
  { href: "/my", label: "MY CONTENT" },
];

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className={`inline-flex items-baseline gap-1.5 font-extrabold tracking-[0.18em] ${light ? "text-white" : "text-navy"}`}>
      <span className="text-[17px]">MIRACLE</span>
      <span className="text-[17px] text-gold">PROMPT</span>
    </span>
  );
}

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);
  if (pathname.startsWith("/admin")) return null;

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-ivory/90 backdrop-blur">
      <div className="container-x flex h-16 items-center justify-between md:h-[72px]">
        <Link href="/" aria-label="MIRACLE PROMPT 홈"><Logo /></Link>
        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`text-[13px] font-bold tracking-[0.14em] transition-colors hover:text-navy ${
                pathname.startsWith(n.href) ? "text-navy" : "text-sub"
              }`}
            >
              {n.label}
            </Link>
          ))}
          <Link href="/membership" className="btn-primary btn-sm">멤버십 시작하기</Link>
        </nav>
        <button className="md:hidden p-2 -mr-2" aria-label="메뉴" onClick={() => setOpen((v) => !v)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#152238" strokeWidth="2">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>
      {open && (
        <nav className="md:hidden border-t border-line bg-ivory">
          <div className="container-x flex flex-col py-3">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="py-3 text-[14px] font-bold tracking-[0.14em] text-navy">
                {n.label}
              </Link>
            ))}
            <Link href="/membership" className="btn-primary mt-2 mb-2">멤버십 시작하기</Link>
          </div>
        </nav>
      )}
    </header>
  );
}
