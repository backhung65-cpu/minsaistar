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
  description: "하나의 프롬프트는 220,000원. 미라클 멤버십은 월 55,000원으로 모든 자료를 이용할 수 있습니다.",
};

export default async function MembershipPage() {
  const [products, session] = await Promise.all([listProducts({ publishedOnly: true }), getSession()]);
  const access = await getAccess(session);
  const included = products.filter((p) => p.membership_included);

  return (
    <>
      <section className="bg-tile text-white">
        <div className="container-x py-16 md:py-24 text-center">
          <div className="eyebrow !text-muted-dark">MIRACLE MEMBERSHIP</div>
          <h1 className="h1 mt-2 text-balance">민진홍 소장의 프롬프트와 AI 솔루션,<br />한 번에 전부 이용하세요.</h1>
          <p className="lead mx-auto mt-4 max-w-2xl !text-muted-dark">
            상품 하나는 220,000원.<br />미라클 멤버십은 월 55,000원으로 전부 이용할 수 있습니다.
          </p>
          <div className="mx-auto mt-10 grid max-w-3xl grid-cols-3 gap-4 border-y border-white/15 py-6">
            <div><div className="text-[30px] md:text-[40px] font-semibold text-white">{included.length}</div><div className="text-[13px] text-muted-dark">이용 가능한 콘텐츠</div></div>
            <div><div className="text-[30px] md:text-[40px] font-semibold">월 5.5만</div><div className="text-[13px] text-muted-dark">정기 결제 · 언제든 해지</div></div>
            <div><div className="text-[30px] md:text-[40px] font-semibold">∞</div><div className="text-[13px] text-muted-dark">신규 · 업데이트 콘텐츠</div></div>
          </div>
          <div className="mt-10">
            {access.membershipActive ? (
              <div className="flex flex-col items-center gap-3">
                <div className="text-[14px] text-muted-dark">현재 멤버십 이용 중 · {fmtDate(access.membership?.expired_at)}까지</div>
                <Link href="/library" className="btn-gold py-4">라이브러리 열기</Link>
              </div>
            ) : (
              <Link href="/checkout?plan=membership" className="btn-gold text-[16px]">미라클 멤버십 시작하기</Link>
            )}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-x">
          <SectionHead eyebrow="INCLUDED" title="멤버십에 포함된 모든 것" />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["마케팅 전략 마스터 프롬프트", "시장 분석부터 90일 실행안까지 · 복사 · 자료 다운로드"],
              ["전자책 출판 지원 솔루션", "기획 · 집필 · 홍보 12단계 GPT · 설명 영상"],
              ["사용 가이드 · 예제", "입력 템플릿 · 결과 예제 · 활용 방법"],
              ["신규 · 업데이트", "새로 등록되는 콘텐츠와 버전 업데이트"],
            ].map(([t, d], i) => (
              <div key={t} className="card">
                
                <div className="mt-4 text-[18px] font-semibold text-ink">{t}</div>
                <div className="mt-2 text-[14.5px] text-sub">{d}</div>
              </div>
            ))}
          </div>
          {included.length > 0 && (
            <div className="mt-12 card">
              <div className="text-[14px] font-semibold text-ink">현재 포함 콘텐츠</div>
              <ul className="mt-4 divide-y divide-line">
                {included.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-4 py-3.5">
                    <Link href={`/prompts/${p.slug}`} className="font-semibold text-ink hover:underline">{p.title}</Link>
                    <span className="shrink-0 text-[13px] text-sub">{p.sale_price > 0 ? <><s>{p.sale_price.toLocaleString()}원</s> → 멤버십 포함</> : "멤버십 전용"}</span>
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
            <div className="text-[15px] font-semibold text-ink">멤버십 다운로드 정책</div>
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
