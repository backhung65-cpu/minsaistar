import type { Metadata } from "next";
import Link from "next/link";
import { getOrderByNumber, getProduct } from "@/lib/repo";
import { getPendingOrders, getSession } from "@/lib/session";
import { fmtDate, won } from "@/lib/format";
import { LicenseNotice } from "@/components/Sections";
import { ClaimOrder } from "./ClaimOrder";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "결제 완료", robots: { index: false } };

export default async function Complete({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order: num } = await searchParams;
  const order = num ? await getOrderByNumber(num) : null;
  const [session, pending] = await Promise.all([getSession(), getPendingOrders()]);
  const claimed = Boolean(order && session?.uid === order.user_id && (session.verified || session.orders.includes(order.id)));
  const mine = Boolean(order && (claimed || pending.includes(order.id)));

  if (!order || !mine) {
    return (
      <Shell>
        <h1 className="text-[22px] font-semibold text-ink">주문 정보를 확인할 수 없습니다.</h1>
        <p className="mt-3 text-sub">결제하신 브라우저가 아니라면 이메일 인증 후 구매 자료를 열 수 있습니다.</p>
        <Link href="/access" className="btn-primary mt-8">구매 자료 다시 열기</Link>
      </Shell>
    );
  }

  // 결제 확정은 반드시 서버 DB의 payment_status = PAID 로만 판단
  if (order.payment_status !== "PAID" || !claimed) {
    const failed = ["FAILED", "CANCELLED", "REFUNDED"].includes(order.payment_status);
    return (
      <Shell>
        {failed ? (
          <>
            <h1 className="text-[22px] font-semibold text-ink">결제가 완료되지 않았습니다.</h1>
            <p className="mt-3 text-sub">결제가 취소되었거나 실패했습니다. 다시 시도해 주세요.</p>
            <Link href="/prompts" className="btn-primary mt-8">스토어로 돌아가기</Link>
          </>
        ) : (
          <>
            <h1 className="text-[22px] font-semibold text-ink">결제를 확인하고 있습니다</h1>
            <ClaimOrder orderNumber={order.order_number} waiting />
            <p className="text-[13px] text-sub">주문번호 {order.order_number}</p>
          </>
        )}
      </Shell>
    );
  }

  const product = order.product_id ? await getProduct(order.product_id) : null;
  const isMembership = order.order_type === "MEMBERSHIP";
  const openHref = isMembership ? "/library" : `/viewer/${product?.slug}`;

  return (
    <section className="container-x max-w-2xl py-14 md:py-20">
      <div className="card text-center md:p-12">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-accent text-[28px] text-white">✓</div>
        <h1 className="mt-6 text-[26px] md:text-[30px] font-semibold text-ink">결제가 완료되었습니다.</h1>
        <p className="mt-3 text-[16px] text-sub">구매하신 콘텐츠가 준비되었습니다.<br /><b className="text-ink">이제 바로 사용해 보세요.</b></p>

        <div className="mt-8 rounded-2xl bg-parchment p-6">
          <div className="text-[14px] font-semibold text-sub">{isMembership ? "MIRACLE MEMBERSHIP" : "MIRACLE PROMPT"}</div>
          <div className="mt-2 text-[20px] font-semibold text-ink">{isMembership ? "민진홍의 마케팅 프롬프트 라이브러리" : product?.title}</div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href={openHref} className="btn-primary text-[16px]">{isMembership ? "지금 라이브러리 열기" : "지금 프롬프트 열기"}</Link>
            {!isMembership && <Link href={`${openHref}#files`} className="btn-outline py-4">자료 다운로드</Link>}
          </div>
        </div>

        <dl className="mt-8 divide-y divide-line border-y border-line text-left text-[14.5px]">
          {[
            ["주문번호", order.order_number],
            ["결제일", fmtDate(order.paid_at, true)],
            ["상품", isMembership ? "MIRACLE MEMBERSHIP (월간)" : product?.title ?? "-"],
            ["결제금액", won(order.amount)],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between py-3"><dt className="text-sub">{k}</dt><dd className="font-semibold text-ink">{v}</dd></div>
          ))}
        </dl>
        <p className="mt-6 text-[13px] text-sub">다른 기기에서는 <Link href="/access" className="underline">이메일 인증</Link>으로 구매 자료를 다시 열 수 있습니다.</p>
      </div>
      <div className="mt-6"><LicenseNotice compact /></div>
    </section>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <section className="container-x max-w-xl py-20">
      <div className="card text-center">{children}</div>
    </section>
  );
}
