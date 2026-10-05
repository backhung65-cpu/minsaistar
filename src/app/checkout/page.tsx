import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getProductBySlug, listProducts } from "@/lib/repo";
import { isMockPayment, MEMBERSHIP_PRICE, paymentsEnabled } from "@/lib/config";
import { getSession } from "@/lib/session";
import { canAccess, getAccess } from "@/lib/access";
import { won } from "@/lib/format";
import { LicenseNotice } from "@/components/Sections";
import { CheckoutSteps, PlanSwitcher } from "@/components/Funnel";
import type { Product } from "@/lib/types";
import { CheckoutForm } from "./CheckoutForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "결제하기", robots: { index: false } };

export default async function Checkout({ searchParams }: { searchParams: Promise<{ product?: string; plan?: string; from?: string }> }) {
  const { product: slug, plan, from } = await searchParams;
  const isMembership = plan === "membership";
  const access = await getAccess(await getSession());

  const all = await listProducts({ publishedOnly: true });
  const bundleValue = all.filter((p) => p.membership_included).reduce((a, p) => a + p.sale_price, 0);

  let title: string;
  let amount: number;
  let lines: string[];
  let product: Product | null = null;
  if (isMembership) {
    if (access.membershipActive) redirect("/library");
    product = from ? await getProductBySlug(from) : null;
    title = "MIRACLE MEMBERSHIP";
    amount = MEMBERSHIP_PRICE;
    lines = [
      ...all.filter((p) => p.membership_included).map((p) => `${p.title}${p.product_type === "GPT" ? " (GPT)" : ""}`),
      "자료 · 설명 영상 · 업데이트",
      "앞으로 추가되는 신규 콘텐츠",
      "매월 자동 결제 · 언제든 해지",
    ];
  } else {
    product = slug ? await getProductBySlug(slug) : null;
    if (!product || product.status !== "PUBLISHED" || product.sale_price <= 0) notFound();
    if (canAccess(access, product)) redirect(`/viewer/${product.slug}`);
    title = product.title;
    amount = product.sale_price;
    lines = product.product_type === "GPT"
      ? ["GPT 솔루션 바로 실행", "솔루션 사용 설명 · 영상", "결과물: " + (product.output || "단계별 결과물"), "해당 상품 업데이트 · 평생 이용"]
      : ["프롬프트 전체 · 원클릭 복사", "사용 방법 · 입력 예제 · 결과 예제", "관련 PDF · MD · TXT · ZIP 자료", "해당 상품 업데이트 · 평생 이용"];
  }

  return (
    <section className="container-x py-12 md:py-16">
      <CheckoutSteps current={2} />
      <h1 className="h2 mt-6 text-ink">결제하기</h1>
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
      <div className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
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
          <PlanSwitcher product={product} isMembership={isMembership} bundleValue={bundleValue} />
          {isMembership && product && (
            <p className="rounded-[11px] bg-parchment px-4 py-3 text-[14px] text-ink-80">
              보고 계시던 <b className="font-semibold text-ink">{product.title}</b>도 멤버십에 포함됩니다.
            </p>
          )}
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
          <LicenseNotice compact />
        </aside>
      </div>
    </section>
  );
}
