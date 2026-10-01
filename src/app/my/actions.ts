"use server";
import { revalidatePath } from "next/cache";
import { isPayAppLive } from "@/lib/config";
import { cancelRebill } from "@/lib/payapp";
import { getMembership, upsertMembership } from "@/lib/repo";
import { getSession } from "@/lib/session";

/** 멤버십 해지: 정기결제 중단, 결제된 기간 종료일까지 이용 가능 */
export async function cancelMembership() {
  const session = await getSession();
  if (!session?.verified) return;
  const m = await getMembership(session.uid);
  if (!m || m.status !== "ACTIVE") return;
  if (isPayAppLive && m.rebill_id) await cancelRebill(m.rebill_id);
  await upsertMembership(session.uid, { status: "CANCELLED", next_payment_at: null });
  revalidatePath("/my");
}
