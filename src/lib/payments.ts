import "server-only";
import { env } from "@/lib/config";
import { safeEqual } from "@/lib/crypto";
import { PAY_STATE } from "@/lib/payapp";
import {
  createEntitlement, createOrder, getMembership, getOrderByNumber, getOrderByPaymentId,
  listEntitlementsByOrder, updateEntitlement, updateOrder, upsertMembership,
} from "@/lib/repo";
import type { Order } from "@/lib/types";

export function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  const day = d.getUTCDate();
  d.setUTCMonth(d.getUTCMonth() + months);
  if (d.getUTCDate() < day) d.setUTCDate(0); // 말일 보정
  return d;
}

/** 결제 확정 → 구매권한 생성 (서버 검증 후에만 호출) */
async function grant(order: Order) {
  const startsAt = new Date();
  if (order.order_type === "SINGLE") {
    await createEntitlement({
      user_id: order.user_id, product_id: order.product_id, order_id: order.id,
      type: "SINGLE", status: "ACTIVE", starts_at: startsAt.toISOString(), expires_at: null,
    });
    return;
  }
  const m = await getMembership(order.user_id);
  const current = m?.expired_at && m.status !== "EXPIRED" ? new Date(m.expired_at) : null;
  const base = current && current > startsAt ? current : startsAt;
  const until = addMonths(base, 1);
  await upsertMembership(order.user_id, {
    status: "ACTIVE",
    rebill_id: order.rebill_id ?? m?.rebill_id ?? null,
    next_payment_at: until.toISOString(),
    expired_at: until.toISOString(),
    ...(m && m.status === "ACTIVE" ? {} : { started_at: startsAt.toISOString() }),
  });
  await createEntitlement({
    user_id: order.user_id, product_id: null, order_id: order.id,
    type: "MEMBERSHIP", status: "ACTIVE", starts_at: startsAt.toISOString(), expires_at: until.toISOString(),
  });
}

async function revoke(order: Order, status: "CANCELLED" | "REFUNDED", payload: Record<string, string>) {
  await updateOrder(order.id, { payment_status: status, raw_payload: payload });
  for (const e of await listEntitlementsByOrder(order.id)) await updateEntitlement(e.id, { status: "REVOKED" });
  if (order.order_type === "MEMBERSHIP") {
    await upsertMembership(order.user_id, { status: "EXPIRED", expired_at: new Date().toISOString() });
  }
}

export type FeedbackResult = { ok: true; order: Order } | { ok: false; error: string };

/**
 * PayApp 결제 통보 처리
 * - userid / linkkey / linkval 이 우리 상점 정보와 일치하는지 검증
 * - var1(내부 주문번호)로 주문을 찾고 결제 금액이 주문 금액과 일치하는지 검증
 * - 검증 통과 시에만 PAID 처리 및 구매권한 생성 (중복 통보는 멱등 처리)
 */
export async function processPayAppFeedback(
  p: Record<string, string>,
  opts: { trusted?: boolean } = {},
): Promise<FeedbackResult> {
  if (!opts.trusted) {
    if (!env.payappUserId || !env.payappLinkKey || !env.payappLinkVal) return { ok: false, error: "payapp not configured" };
    if (
      !safeEqual(p.userid ?? "", env.payappUserId) ||
      !safeEqual(p.linkkey ?? "", env.payappLinkKey) ||
      !safeEqual(p.linkval ?? "", env.payappLinkVal)
    ) return { ok: false, error: "merchant verification failed" };
  }

  const order = await getOrderByNumber(p.var1 ?? "");
  if (!order) return { ok: false, error: "order not found" };
  if (Number(p.price) !== order.amount) return { ok: false, error: "amount mismatch" };

  const state = String(p.pay_state ?? "");
  const mulNo = p.mul_no || null;
  const rebillNo = p.rebill_no || order.rebill_id || null;

  /* 결제 완료 */
  if (state === PAY_STATE.PAID) {
    if (order.payment_status === "PENDING" || order.payment_status === "FAILED") {
      const paid = await updateOrder(order.id, {
        payment_status: "PAID", payment_id: mulNo, rebill_id: rebillNo,
        paid_at: new Date().toISOString(), raw_payload: p,
      });
      await grant(paid);
      return { ok: true, order: paid };
    }
    if (order.payment_status === "PAID" && (!mulNo || order.payment_id === mulNo)) {
      return { ok: true, order }; // 중복 통보
    }
    // 정기결제 갱신: 같은 주문번호(var1)로 새로운 결제(mul_no)가 통보됨
    if (order.order_type === "MEMBERSHIP" && order.payment_status === "PAID" && mulNo) {
      const dup = await getOrderByPaymentId(mulNo);
      if (dup) return { ok: true, order: dup };
      const renewal = await createOrder({ user_id: order.user_id, product_id: null, order_type: "MEMBERSHIP", amount: order.amount });
      const paid = await updateOrder(renewal.id, {
        payment_status: "PAID", payment_id: mulNo, rebill_id: rebillNo,
        paid_at: new Date().toISOString(), raw_payload: p,
      });
      await grant(paid);
      return { ok: true, order: paid };
    }
    return { ok: false, error: `unexpected order state ${order.payment_status}` };
  }

  /* 승인 취소 / 부분 취소 */
  if ((PAY_STATE.CANCELLED as readonly string[]).includes(state) || (PAY_STATE.PARTIAL_CANCELLED as readonly string[]).includes(state)) {
    const target = (mulNo && (await getOrderByPaymentId(mulNo))) || order;
    if (target.payment_status === "PAID") await revoke(target, "CANCELLED", p);
    return { ok: true, order: target };
  }

  /* 요청 취소 */
  if ((PAY_STATE.REQUEST_CANCELLED as readonly string[]).includes(state)) {
    if (order.payment_status === "PENDING") {
      return { ok: true, order: await updateOrder(order.id, { payment_status: "FAILED", raw_payload: p }) };
    }
    return { ok: true, order };
  }

  // 1(요청), 10(대기) 등은 상태 변경 없음
  return { ok: true, order };
}

/** 관리자 수동 취소 */
export async function adminCancelOrder(order: Order) {
  if (order.payment_status === "PAID") await revoke(order, "REFUNDED", { by: "admin" });
}
