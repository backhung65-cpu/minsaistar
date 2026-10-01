import "server-only";
import { env } from "@/lib/config";

/**
 * PayApp REST API
 * https://www.payapp.kr/dev_center/dev_center01.html
 *  - payrequest  : 단건 결제 요청
 *  - rebillRegist: 정기결제(월) 등록
 *  - rebillCancel: 정기결제 해지
 * 결제 완료 시 PayApp 서버가 feedbackurl로 결과를 통보하며, 우리 서버는 "SUCCESS"를 응답해야 한다.
 */
const API_URL = "https://api.payapp.kr/oapi/apiLoad.html";

async function call(params: Record<string, string>): Promise<Record<string, string>> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded; charset=utf-8" },
    body: new URLSearchParams(params).toString(),
    cache: "no-store",
  });
  const text = await res.text();
  return Object.fromEntries(new URLSearchParams(text));
}

const onlyDigits = (s: string) => s.replace(/\D/g, "");

export interface PayRequest {
  orderNumber: string;
  goodName: string;
  price: number;
  phone: string;
  email: string;
  name: string;
}

export async function requestPayment(p: PayRequest): Promise<{ payUrl: string; mulNo: string }> {
  const r = await call({
    cmd: "payrequest",
    userid: env.payappUserId,
    goodname: p.goodName,
    price: String(p.price),
    recvphone: onlyDigits(p.phone),
    memo: `${p.name} / ${p.email}`,
    smsuse: "n",
    redirectpay: "1",
    checkretry: "y",
    feedbackurl: `${env.siteUrl}/api/payapp/feedback`,
    returnurl: `${env.siteUrl}/api/payapp/return?order=${p.orderNumber}`,
    var1: p.orderNumber,
  });
  if (r.state !== "1" || !r.payurl) throw new Error(r.errorMessage || "PayApp 결제 요청에 실패했습니다.");
  return { payUrl: r.payurl, mulNo: r.mul_no };
}

export async function registerRebill(p: PayRequest): Promise<{ payUrl: string; rebillNo: string }> {
  const kst = new Date(Date.now() + 9 * 3600_000);
  const day = Math.min(kst.getUTCDate(), 28);
  const expire = new Date(kst);
  expire.setUTCFullYear(expire.getUTCFullYear() + 5);
  const r = await call({
    cmd: "rebillRegist",
    userid: env.payappUserId,
    goodname: p.goodName,
    goodprice: String(p.price),
    recvphone: onlyDigits(p.phone),
    rebillCycleType: "Month",
    rebillCycleMonth: String(day),
    rebillExpire: expire.toISOString().slice(0, 10),
    smsuse: "n",
    feedbackurl: `${env.siteUrl}/api/payapp/feedback`,
    returnurl: `${env.siteUrl}/api/payapp/return?order=${p.orderNumber}`,
    var1: p.orderNumber,
  });
  if (r.state !== "1" || !r.payurl) throw new Error(r.errorMessage || "PayApp 정기결제 등록에 실패했습니다.");
  return { payUrl: r.payurl, rebillNo: r.rebill_no };
}

export async function cancelRebill(rebillNo: string): Promise<boolean> {
  const r = await call({ cmd: "rebillCancel", userid: env.payappUserId, rebill_no: rebillNo, linkkey: env.payappLinkKey });
  return r.state === "1";
}

/** PayApp 결제 상태 코드 */
export const PAY_STATE = {
  REQUESTED: "1",
  PAID: "4",
  REQUEST_CANCELLED: ["8", "32"],
  CANCELLED: ["9", "64"],
  WAITING: "10",
  PARTIAL_CANCELLED: ["70", "71"],
} as const;
