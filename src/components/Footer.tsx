"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const COLS = [
  { h: "둘러보기", links: [["/prompts", "프롬프트 스토어"], ["/membership", "미라클 멤버십"], ["/prompts/marketing-master", "마케팅 전략 마스터"]] },
  { h: "내 계정", links: [["/my", "내 콘텐츠"], ["/library", "멤버십 라이브러리"], ["/access", "구매자료 다시 열기"]] },
  { h: "정책", links: [["/license", "라이선스 · 이용 규정"], ["/terms", "이용약관 · 환불 정책"], ["/privacy", "개인정보처리방침"]] },
];

export function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  return (
    <footer className="bg-parchment pb-24 text-ink-80 md:pb-0">
      <div className="container-x py-12 md:py-16">
        <p className="border-b border-hairline pb-4 text-[12px] leading-[1.5] text-sub">
          구매한 프롬프트와 자료는 구매자 본인의 업무 · 마케팅 · 사업에만 사용할 수 있습니다. 원문 · 파일의 제3자 공유, 재판매, 온라인 공개를 금지합니다.
        </p>
        <div className="grid grid-cols-2 gap-x-8 gap-y-6 pt-6 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <div className="text-[14px] font-semibold text-ink">MIRACLE PROMPT</div>
            <p className="mt-2 text-[12px] leading-[1.6] text-sub">미라클마케팅 연구소<br />민진홍의 마케팅 사고를 프롬프트로.</p>
          </div>
          {COLS.map((c) => (
            <div key={c.h}>
              <div className="text-[12px] font-semibold text-ink">{c.h}</div>
              <ul className="mt-1">
                {c.links.map(([href, label]) => (
                  <li key={href}><Link href={href} className="text-[12px] leading-[2.41] text-ink-80 hover:underline">{label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-8 border-t border-hairline pt-4 text-[12px] text-sub">
          © {new Date().getFullYear()} MIRACLE PROMPT. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
