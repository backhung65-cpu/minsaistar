import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getProductBySlug } from "@/lib/repo";
import { isMockPayment, MEMBERSHIP_PRICE, paymentsEnabled } from "@/lib/config";
import { getSession } from "@/lib/session";
import { canAccess, getAccess } from "@/lib/access";
import { won } from "@/lib/format";
import { LicenseNotice } from "@/components/Sections";
import { CheckoutForm } from "./CheckoutForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "결제하기", robots: { index: false } };

export default async function Checkout({ searchParams }: { searchParams: Promise<{ product?: string; plan?: string }> }) {
  const { product: slug, plan } = await searchParams;
  const isMembership = plan === "membership";
  const access = await getAccess(await getSession());

  let title: string;
  let amount: number;
  let lines: string[];
  if (isMembership) {
    if (access.membershipActive) redirect("/library");
    title = "MIRACLE MEMBERSHIP";
    amount = MEMBERSHIP_PRICE;
    lines = ["멤버십 포함 전체 프롬프트", "전체 ZIP · PDF · MD · TXT 자료", "템플릿 · 실전 예제", "신규 · 업데이트 콘텐츠", "매월 자동 결제 · 언제든 해지"];
  } else {
    const product = slug ? await getProductBySlug(slug) : null;
    if (!product || product.status !== "PUBLISHED") notFound();
    if (canAccess(access, product)) redirect(`/viewer/${product.slug}`);
    title = product.title;
    amount = product.sale_price;
    lines = ["프롬프트 전체 · 원클릭 복사", "사용 방법 · 입력 예제 · 결과 예제", "관련 PDF · MD · TXT · ZIP 자료", "해당 상품 업데이트"];
  }

  return (
    <section className="container-x py-12 md:py-16">
      <div className="eyebrow">CHECKOUT</div>
      <h1 className="h2 mt-3 text-ink">결제하기</h1>
      {isMockPayment && (
        <p className="mt-4 rounded-[11px] bg-parchment px-4 py-3 text-[14px] text-ink-80">
          데모 모드: PayApp 환경변수가 설정되지 않아 모의 결제로 진행됩니다.
        </p>
      )}
      {!paymentsEnabled && (
        <p className="mt-4 rounded-xl border border-line bg-white px-4 py-3 text-[14px] font-semibold text-ink">
          결제 준비 중입니다. 곧 결제를 오픈합니다.
        </p>
      )}
      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_420px]">
        <div className="card order-2 lg:order-1">
          <h2 className="text-[18px] font-semibold text-ink">구매자 정보</h2>
          <p className="mt-1 text-[13.5px] text-sub">회원가입 없이 구매할 수 있습니다.</p>
          <div className="mt-6">
            <CheckoutForm
              plan={isMembership ? "membership" : undefined}
              product={isMembership ? undefined : slug}
              disabled={!paymentsEnabled}
              cta={isMembership ? `월 ${won(amount)} 멤버십 결제하기` : `${won(amount)} 결제하기`}
            />
          </div>
        </div>
        <aside className="order-1 space-y-4 lg:order-2">
          <div className={`rounded-[18px] p-6 md:p-8 ${isMembership ? "bg-tile text-white" : "card"}`}>
            <div className={`text-[14px] font-semibold ${isMembership ? "text-muted-dark" : "text-sub"}`}>{isMembership ? "MEMBERSHIP" : "SINGLE"}</div>
            <div className={`mt-2 text-[20px] font-semibold ${isMembership ? "" : "text-ink"}`}>{title}</div>
            <ul className={`mt-5 space-y-2 text-[14px] ${isMembership ? "text-muted-dark" : "text-sub"}`}>
              {lines.map((l) => <li key={l}>· {l}</li>)}
            </ul>
            <div className={`mt-6 flex items-end justify-between border-t pt-5 ${isMembership ? "border-white/15" : "border-line"}`}>
              <span className="text-[14px]">결제 금액</span>
              <span className="text-[28px] font-semibold">{isMembership ? "월 " : ""}{won(amount)}</span>
            </div>
          </div>
          {!isMembership && (
            <Link href="/checkout?plan=membership" className="block rounded-2xl border border-accent/50 bg-parchment p-5 text-[14px] text-ink">
              <b>월 50,000원</b>이면 이 프롬프트를 포함한 <b>모든 자료</b>를 이용할 수 있습니다. <span className="font-semibold underline">멤버십으로 변경 →</span>
            </Link>
          )}
          <LicenseNotice compact />
        </aside>
      </div>
    </section>
  );
}
