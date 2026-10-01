import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { appSecret } from "@/lib/config";

export function hmac(value: string): string {
  return createHmac("sha256", appSecret()).update(value).digest("base64url");
}

export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

/** 서명된 토큰: base64url(JSON).signature */
export function signToken(payload: object): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${hmac(body)}`;
}

export function verifyToken<T extends object>(token: string | undefined | null): T | null {
  if (!token) return null;
  // APP_SECRET 미설정 시 페이지 전체가 깨지지 않도록 '세션 없음'으로 처리
  try {
    hmac("");
  } catch {
    return null;
  }
  const [body, sig] = token.split(".");
  if (!body || !sig || !safeEqual(sig, hmac(body))) return null;
  try {
    const data = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as T & { exp?: number };
    if (data.exp && data.exp < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

export function randomHex(bytes: number): string {
  return randomBytes(bytes).toString("hex").toUpperCase();
}

export function randomCode(): string {
  return String(randomBytes(4).readUInt32BE() % 1_000_000).padStart(6, "0");
}
