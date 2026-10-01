import "server-only";
import { getMembership, listEntitlementsByUser, listProducts } from "@/lib/repo";
import type { SessionData } from "@/lib/session";
import type { Membership, Product } from "@/lib/types";

const GRACE_MS = 3 * 86_400_000; // 정기결제 지연 대비 3일 유예

export function isMembershipActive(m: Membership | null): boolean {
  if (!m || m.status === "EXPIRED" || !m.expired_at) return false;
  return new Date(m.expired_at).getTime() + (m.status === "ACTIVE" ? GRACE_MS : 0) > Date.now();
}

export interface AccessInfo {
  membership: Membership | null;
  membershipActive: boolean;
  ownedProductIds: Set<string>;
}

/** 세션 기준 이용 권한 계산 (DB의 PAID 주문으로 생성된 entitlements만 신뢰) */
export async function getAccess(session: SessionData | null): Promise<AccessInfo> {
  const empty: AccessInfo = { membership: null, membershipActive: false, ownedProductIds: new Set() };
  if (!session) return empty;

  const all = (await listEntitlementsByUser(session.uid)).filter((e) => e.status === "ACTIVE");
  const ents = session.verified ? all : all.filter((e) => e.order_id && session.orders.includes(e.order_id));

  const membership = await getMembership(session.uid);
  const hasMembershipEnt = ents.some((e) => e.type === "MEMBERSHIP");
  const membershipActive = hasMembershipEnt && isMembershipActive(membership);

  const owned = new Set<string>();
  const singles = ents.filter((e) => e.type === "SINGLE" && e.product_id);
  if (singles.length) {
    const products = await listProducts();
    const byId = new Map(products.map((p) => [p.id, p]));
    for (const e of singles) {
      owned.add(e.product_id!);
      const p = byId.get(e.product_id!);
      if (p?.product_type === "PACKAGE") p.package_product_ids.forEach((id) => owned.add(id));
    }
  }
  return { membership: hasMembershipEnt || session.verified ? membership : null, membershipActive, ownedProductIds: owned };
}

export function canAccess(access: AccessInfo, product: Product): boolean {
  if (product.badges.includes("FREE")) return true;
  if (access.ownedProductIds.has(product.id)) return true;
  return access.membershipActive && product.membership_included && product.status !== "DRAFT";
}
