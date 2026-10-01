import "server-only";
import { cookies } from "next/headers";
import { safeEqual, signToken, verifyToken } from "@/lib/crypto";
import { adminPassword } from "@/lib/config";
import { getUser } from "@/lib/repo";
import type { User } from "@/lib/types";

/**
 * 구매자 세션
 * - verified=true : 이메일 인증 완료 → 해당 사용자의 모든 권한 이용
 * - verified=false: 이 브라우저에서 결제한 주문(orders)의 권한만 이용
 *   (타인의 이메일을 입력해 결제하더라도 기존 구매 내역에는 접근 불가)
 */
export interface SessionData {
  uid: string;
  verified: boolean;
  orders: string[];
  exp: number;
}

const SESSION_COOKIE = "mp_session";
const PENDING_COOKIE = "mp_pending";
const ADMIN_COOKIE = "mp_admin";
const DAY = 86_400_000;

const cookieOpts = (maxAgeSec: number) => ({
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: maxAgeSec,
});

export async function getSession(): Promise<SessionData | null> {
  return verifyToken<SessionData>((await cookies()).get(SESSION_COOKIE)?.value);
}

export async function getSessionUser(): Promise<{ session: SessionData; user: User } | null> {
  const session = await getSession();
  if (!session) return null;
  const user = await getUser(session.uid);
  return user ? { session, user } : null;
}

export async function setSession(data: Omit<SessionData, "exp">) {
  const exp = Date.now() + 90 * DAY;
  (await cookies()).set(SESSION_COOKIE, signToken({ ...data, exp }), cookieOpts(90 * 86400));
}

export async function clearSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

/* 결제 대기 주문: 주문 생성 브라우저 표시 (결제완료 후 세션으로 승격) */
export async function addPendingOrder(orderId: string) {
  const jar = await cookies();
  const cur = verifyToken<{ ids: string[] }>(jar.get(PENDING_COOKIE)?.value)?.ids ?? [];
  const ids = [...new Set([orderId, ...cur])].slice(0, 10);
  jar.set(PENDING_COOKIE, signToken({ ids, exp: Date.now() + 2 * DAY }), cookieOpts(2 * 86400));
}

export async function getPendingOrders(): Promise<string[]> {
  return verifyToken<{ ids: string[] }>((await cookies()).get(PENDING_COOKIE)?.value)?.ids ?? [];
}

/** 결제 완료된 주문을 현재 브라우저 세션에 연결 */
export async function attachOrderToSession(userId: string, orderId: string) {
  const s = await getSession();
  if (s && s.uid === userId) {
    if (!s.orders.includes(orderId)) await setSession({ ...s, orders: [...s.orders, orderId].slice(-50) });
  } else {
    await setSession({ uid: userId, verified: false, orders: [orderId] });
  }
}

/* ───────────────────────── 관리자 ───────────────────────── */

export async function isAdmin(): Promise<boolean> {
  return Boolean(verifyToken<{ admin: true }>((await cookies()).get(ADMIN_COOKIE)?.value)?.admin);
}

export async function adminLogin(password: string): Promise<boolean> {
  const expected = adminPassword();
  if (!expected || !safeEqual(password, expected)) return false;
  (await cookies()).set(ADMIN_COOKIE, signToken({ admin: true, exp: Date.now() + DAY / 2 }), cookieOpts(43200));
  return true;
}

export async function adminLogout() {
  (await cookies()).delete(ADMIN_COOKIE);
}
