"use server";
import { redirect } from "next/navigation";
import { isPayAppLive, MEMBERSHIP_NAME, MEMBERSHIP_PRICE } from "@/lib/config";
import { registerRebill, requestPayment } from "@/lib/payapp";
import { processPayAppFeedback } from "@/lib/payments";
import { createOrder, getOrderByNumber, getProductBySlug, updateOrder, upsertUser } from "@/lib/repo";
import { addPendingOrder, attachOrderToSession, getPendingOrders, getSession } from "@/lib/session";

export type CheckoutState = { error?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function startCheckout(_: CheckoutState, form: FormData): Promise<CheckoutState> {
  const name = String(form.get("name") ?? "").trim();
  const phone = String(form.get("phone") ?? "").replace(/[^\d]/g, "");
  const email = String(form.get("email") ?? "").trim();
  const plan = String(form.get("plan") ?? "");
  const slug = String(form.get("product") ?? "");

  if (!name) return { error: "이름을 입력해 주세요." };
  if (!/^01\d{8,9}$/.test(phone)) return { error: "휴대전화 번호를 정확히 입력해 주세요." };
  if (!EMAIL_RE.test(email)) return { error: "이메일 주소를 정확히 입력해 주세요." };
  if (form.get("agree") !== "on") return { error: "이용약관 및 라이선스에 동의해 주세요." };

  let goodName: string;
  let amount: number;
  let productId: string | null = null;
  const isMembership = plan === "membership";

  if (isMembership) {
    goodName = `${MEMBERSHIP_NAME} (월간)`;
    amount = MEMBERSHIP_PRICE;
  } else {
    const product = await getProductBySlug(slug);
    if (!product || product.status !== "PUBLISHED") return { error: "판매 중인 상품이 아닙니다." };
    if (product.badges.includes("FREE") || product.sale_price <= 0) return { error: "무료 콘텐츠는 결제 없이 이용할 수 있습니다." };
    goodName = product.title;
    amount = product.sale_price;
    productId = product.id;
  }

  const user = await upsertUser({ name, email, phone });
  const order = await createOrder({ user_id: user.id, product_id: productId, order_type: isMembership ? "MEMBERSHIP" : "SINGLE", amount });
  await addPendingOrder(order.id);

  if (!isPayAppLive) redirect(`/checkout/mock?order=${order.order_number}`);

  let payUrl: string;
  try {
    const req = { orderNumber: order.order_number, goodName, price: amount, phone, email: user.email, name };
    if (isMembership) {
      const r = await registerRebill(req);
      await updateOrder(order.id, { rebill_id: r.rebillNo });
      payUrl = r.payUrl;
    } else {
      const r = await requestPayment(req);
      await updateOrder(order.id, { payment_id: r.mulNo });
      payUrl = r.payUrl;
    }
  } catch (e) {
    await updateOrder(order.id, { payment_status: "FAILED" });
    return { error: e instanceof Error ? e.message : "결제 요청 중 오류가 발생했습니다." };
  }
  redirect(payUrl);
}

/** 데모 모드 전용: PayApp 서버 통보를 모의 실행 */
export async function mockPay(form: FormData) {
  if (isPayAppLive) throw new Error("not available");
  const orderNumber = String(form.get("order") ?? "");
  const order = await getOrderByNumber(orderNumber);
  if (!order || !(await getPendingOrders()).includes(order.id)) redirect("/");
  await processPayAppFeedback(
    { var1: order.order_number, price: String(order.amount), pay_state: "4", mul_no: `MOCK${Date.now()}`, pay_type: "card" },
    { trusted: true },
  );
  redirect(`/checkout/complete?order=${order.order_number}`);
}

/** 결제완료 페이지: 결제 확정(PAID)된 주문을 이 브라우저 세션에 연결 */
export async function claimOrder(orderNumber: string): Promise<{ status: string }> {
  const order = await getOrderByNumber(orderNumber);
  if (!order) return { status: "NOT_FOUND" };
  const pending = await getPendingOrders();
  const session = await getSession();
  const mine = pending.includes(order.id) || (session?.uid === order.user_id && (session.verified || session.orders.includes(order.id)));
  if (!mine) return { status: "FORBIDDEN" };
  if (order.payment_status === "PAID" && !(session?.uid === order.user_id && (session.verified || session.orders.includes(order.id)))) {
    await attachOrderToSession(order.user_id, order.id);
    return { status: "CLAIMED" };
  }
  return { status: order.payment_status };
}
