import { notFound } from "next/navigation";
import { isMockPayment } from "@/lib/config";
import { getOrderByNumber, getProduct } from "@/lib/repo";
import { won } from "@/lib/format";
import { mockPay } from "../actions";

export const dynamic = "force-dynamic";

export default async function MockPay({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  if (!isMockPayment) notFound();
  const { order: num } = await searchParams;
  const order = num ? await getOrderByNumber(num) : null;
  if (!order) notFound();
  const product = order.product_id ? await getProduct(order.product_id) : null;
  return (
    <section className="container-x max-w-lg py-16">
      <div className="card text-center">
        <div className="text-[12px] font-bold tracking-[0.2em] text-sub">PAYAPP · 모의 결제 (DEMO)</div>
        <div className="mt-4 text-[18px] font-bold text-navy">{product?.title ?? "MIRACLE MEMBERSHIP (월간)"}</div>
        <div className="mt-2 text-[32px] font-extrabold text-navy">{won(order.amount)}</div>
        <div className="mt-1 font-mono text-[13px] text-sub">{order.order_number}</div>
        <p className="mt-6 rounded-xl bg-ivory p-4 text-[13px] leading-relaxed text-sub">
          실제 운영 환경에서는 PayApp 결제창으로 이동합니다. 아래 버튼은 PayApp 서버 결제 통보(feedback)를 모의로 실행하여
          서버 검증 → 주문 PAID → 구매권한 생성 흐름을 그대로 테스트합니다.
        </p>
        <form action={mockPay} className="mt-6">
          <input type="hidden" name="order" value={order.order_number} />
          <button className="btn-primary w-full py-4">테스트 결제 완료</button>
        </form>
      </div>
    </section>
  );
}
