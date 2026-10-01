"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Header";

export function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  return (
    <footer className="bg-navy text-white/70 pb-24 md:pb-0">
      <div className="container-x py-14 grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo light />
          <p className="mt-4 text-[14px] leading-relaxed">
            민진홍 소장의 마케팅 경험과 사고체계를<br />AI 시대에 바로 사용할 수 있도록 구조화한 전문 지식 라이브러리
          </p>
          <p className="mt-6 text-[12px] text-white/40">미라클마케팅 연구소</p>
        </div>
        <div className="text-[14px] space-y-2.5">
          <div className="eyebrow mb-4">SERVICE</div>
          <Link className="block hover:text-white" href="/prompts">프롬프트 스토어</Link>
          <Link className="block hover:text-white" href="/membership">미라클 멤버십</Link>
          <Link className="block hover:text-white" href="/my">내 콘텐츠</Link>
          <Link className="block hover:text-white" href="/access">구매자료 다시 열기</Link>
        </div>
        <div className="text-[14px] space-y-2.5">
          <div className="eyebrow mb-4">POLICY</div>
          <Link className="block hover:text-white" href="/license">라이선스 · 이용 규정</Link>
          <Link className="block hover:text-white" href="/terms">이용약관 · 환불 정책</Link>
          <Link className="block hover:text-white" href="/privacy">개인정보처리방침</Link>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x py-6 text-[12px] text-white/40">
          © {new Date().getFullYear()} MIRACLE PROMPT. All rights reserved. 구매 콘텐츠의 무단 공유 · 재판매를 금지합니다.
        </div>
      </div>
    </footer>
  );
}
