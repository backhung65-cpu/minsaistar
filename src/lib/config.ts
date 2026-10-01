import "server-only";

export const SINGLE_PRICE = 200_000;
export const MEMBERSHIP_PRICE = 50_000;
export const MEMBERSHIP_PLAN = "MIRACLE_MONTHLY";
export const MEMBERSHIP_NAME = "MIRACLE MEMBERSHIP";

export const env = {
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, ""),
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  storageBucket: process.env.SUPABASE_STORAGE_BUCKET || "product-files",
  publicBucket: process.env.SUPABASE_PUBLIC_BUCKET || "public-assets",
  payappUserId: process.env.PAYAPP_USERID || "",
  payappLinkKey: process.env.PAYAPP_LINKKEY || "",
  payappLinkVal: process.env.PAYAPP_LINKVAL || "",
  resendKey: process.env.RESEND_API_KEY || "",
  mailFrom: process.env.MAIL_FROM || "MIRACLE PROMPT <no-reply@example.com>",
  adminPassword: process.env.ADMIN_PASSWORD || "",
};

/** Supabase가 설정되지 않으면 로컬 데모 모드(.data/ JSON 저장소)로 동작 */
export const isSupabase = Boolean(env.supabaseUrl && env.supabaseServiceKey);
export const isDemo = !isSupabase;
/** PayApp이 설정되지 않으면 모의 결제로 동작 */
export const isPayAppLive = Boolean(env.payappUserId && env.payappLinkKey && env.payappLinkVal);

export function appSecret(): string {
  const s = process.env.APP_SECRET;
  if (s && s.length >= 16) return s;
  if (isDemo || process.env.NODE_ENV !== "production") return "miracle-prompt-dev-secret-do-not-use";
  throw new Error("APP_SECRET 환경변수(16자 이상)가 필요합니다.");
}

export function adminPassword(): string | null {
  if (env.adminPassword) return env.adminPassword;
  return isDemo ? "admin" : null;
}
