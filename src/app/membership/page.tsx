import type { Metadata } from "next";
import Link from "next/link";
import { listProducts } from "@/lib/repo";
import { getSession } from "@/lib/session";
import { getAccess } from "@/lib/access";
import { fmtDate } from "@/lib/format";
import { ExpertSection, Faq, FinalCta, LicenseNotice, PricingCompare, SectionHead } from "@/components/Sections";
import { StickyCta } from "@/components/StickyCta";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "MIRACLE MEMBERSHIP",
  description: "하나의 프롬프트는 200,000원. 미라클 멤버십은 월 50,000원으로 모든 자료를 이용할 수 있습니다.",
};

export default async function MembershipPage() {
  const [products, session] = await Promise.all([listProducts({ publishedOnly: true }), getSession()]);
  const access = await getAccess(session);
  const included = products.filter((p) => p.membership_included);

  return (
    <>
      <section className="bg-navy text-white">
        <div className="container-x py-16 md:py-24 text-center">
          <div className="eyebrow">MIRACLE MEMBERSHIP</div>
          <h1 className="h1 mt-5">민진홍의 마케팅 프롬프트<br />라이브러리 전체를 이용하세요.</h1>
          <p className="mx-auto mt-6 max-w-2xl text-[17px] leading-relaxed text-white/70">
            하나의 프롬프트는 200,000원.<br />미라클 멤버십은 월 50,000원으로 모든 자료를 이용할 수 있습니다.
          </p>
          <div className="mx-auto mt-10 grid max-w-3xl grid-cols-3 gap-4 border-y border-white/10 py-6">
            <div><div className="text-[30px] md:text-[40px] font-extrabold text-gold">{included.length}</div><div className="text-[13px] text-white/60">이용 가능한 콘텐츠</div></div>
            <div><div className="text-[30px] md:text-[40px] font-extrabold">월 5만</div><div className="text-[13px] text-white/60">정기 결제 · 언제든 해지</div></div>
            <div><div className="text-[30px] md:text-[40px] font-extrabold">∞</div><div className="text-[13px] text-white/60">신규 · 업데이트 콘텐츠</div></div>
          </div>
          <div className="mt-10">
            {access.membershipActive ? (
              <div className="flex flex-col items-center gap-3">
                <div className="text-[14px] text-white/70">현재 멤버십 이용 중 · {fmtDate(access.membership?.expired_at)}까지</div>
                <Link href="/library" className="btn-gold px-10 py-4">라이브러리 열기</Link>
              </div>
            ) : (
              <Link href="/checkout?plan=membership" className="btn-gold px-10 py-4 text-[16px]">미라클 멤버십 시작하기</Link>
            )}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-x">
          <SectionHead eyebrow="INCLUDED" title="멤버십에 포함된 모든 것" />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["전체 프롬프트", "멤버십 포함 프롬프트 전부 열람 · 복사"],
              ["전체 자료", "ZIP · PDF · MD · TXT 다운로드"],
              ["템플릿 · 실전 예제", "입력 템플릿과 결과 예제"],
              ["신규 · 업데이트", "새로 등록되는 콘텐츠와 버전 업데이트"],
            ].map(([t, d], i) => (
              <div key={t} className="card">
                <div className="font-mono text-[13px] text-gold">{String(i + 1).padStart(2, "0")}</div>
                <div className="mt-4 text-[18px] font-bold text-navy">{t}</div>
                <div className="mt-2 text-[14.5px] text-sub">{d}</div>
              </div>
            ))}
          </div>
          {included.length > 0 && (
            <div className="mt-12 card">
              <div className="text-[14px] font-bold text-navy">현재 포함 콘텐츠</div>
              <ul className="mt-4 divide-y divide-line">
                {included.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-4 py-3.5">
                    <Link href={`/prompts/${p.slug}`} className="font-semibold text-navy hover:underline">{p.title}</Link>
                    <span className="shrink-0 text-[13px] text-sub"><s>{p.sale_price.toLocaleString()}원</s> → 멤버십 포함</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      <PricingCompare />
      <ExpertSection />
      <section className="pb-16">
        <div className="container-x">
          <div className="card">
            <div className="text-[15px] font-bold text-navy">멤버십 다운로드 정책</div>
            <p className="mt-3 text-[14.5px] leading-relaxed text-sub">
              멤버십 활성 기간에는 멤버십에 포함된 모든 자료를 열람·복사·다운로드할 수 있습니다.
              다운로드한 파일은 사용자의 기기에 저장되므로 서비스에서 기술적으로 회수하지 않습니다.
              다만 자료 원본을 제3자에게 공유하거나 재판매하는 것은 금지됩니다.
            </p>
            <div className="mt-5"><LicenseNotice compact /></div>
          </div>
        </div>
      </section>
      <Faq />
      <FinalCta />
      <StickyCta />
    </>
  );
}
