"use server";
import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { db } from "@/lib/db/adapter";
import { hmac, randomCode, safeEqual } from "@/lib/crypto";
import { accessCodeMail, canSendMail, sendMail } from "@/lib/mail";
import { getUserByEmail, normalizeEmail } from "@/lib/repo";
import { clearSession, setSession } from "@/lib/session";

export type AccessState = { step: "email" | "code"; email?: string; error?: string; info?: string; devCode?: string };

const safeNext = (n: unknown) => (typeof n === "string" && /^\/[a-z0-9/_-]*$/i.test(n) ? n : "/my");

export async function requestCode(_: AccessState, form: FormData): Promise<AccessState> {
  const email = normalizeEmail(String(form.get("email") ?? ""));
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { step: "email", error: "이메일 주소를 정확히 입력해 주세요." };

  const recent = (await db.list("access_codes", { email })).filter((c) => Date.now() - new Date(c.created_at).getTime() < 60_000);
  if (recent.length) return { step: "code", email, info: "인증코드가 이미 발송되었습니다. 1분 후 다시 요청할 수 있습니다." };

  const user = await getUserByEmail(email);
  // 존재 여부를 노출하지 않도록 동일한 응답을 반환
  if (!user) return { step: "code", email, info: "구매 내역이 있는 이메일이라면 인증코드가 발송됩니다." };

  const code = randomCode();
  await db.insert("access_codes", {
    id: randomUUID(), email, code_hash: hmac(`${email}:${code}`), attempts: 0,
    expires_at: new Date(Date.now() + 10 * 60_000).toISOString(), used_at: null, created_at: new Date().toISOString(),
  });

  if (canSendMail()) {
    await sendMail(email, "[MIRACLE PROMPT] 구매 자료 접근 인증코드", accessCodeMail(code));
    return { step: "code", email, info: "구매 내역이 있는 이메일이라면 인증코드가 발송됩니다." };
  }
  if (process.env.NODE_ENV !== "production") {
    return { step: "code", email, info: "데모 모드: 메일 발송이 설정되지 않아 인증코드를 화면에 표시합니다.", devCode: code };
  }
  return { step: "email", error: "메일 발송이 설정되지 않았습니다. 관리자에게 문의해 주세요." };
}

export async function verifyCode(_: AccessState, form: FormData): Promise<AccessState> {
  const email = normalizeEmail(String(form.get("email") ?? ""));
  const code = String(form.get("code") ?? "").replace(/\D/g, "");
  const codes = (await db.list("access_codes", { email }))
    .filter((c) => !c.used_at && new Date(c.expires_at).getTime() > Date.now())
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
  const latest = codes[0];
  if (!latest || latest.attempts >= 5) return { step: "code", email, error: "인증코드가 만료되었습니다. 다시 요청해 주세요." };

  if (!safeEqual(latest.code_hash, hmac(`${email}:${code}`))) {
    await db.update("access_codes", latest.id, { attempts: latest.attempts + 1 });
    return { step: "code", email, error: "인증코드가 일치하지 않습니다." };
  }
  await db.update("access_codes", latest.id, { used_at: new Date().toISOString() });
  const user = await getUserByEmail(email);
  if (!user) return { step: "email", error: "구매 내역을 찾을 수 없습니다." };
  await setSession({ uid: user.id, verified: true, orders: [] });
  redirect(safeNext(form.get("next")));
}

export async function logout() {
  await clearSession();
  redirect("/");
}
