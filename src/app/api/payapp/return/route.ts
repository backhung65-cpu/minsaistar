import { NextResponse } from "next/server";

/** PayApp 결제 후 사용자 브라우저 복귀 (GET/POST 모두 지원) → 결제완료 페이지 */
function back(req: Request) {
  const url = new URL(req.url);
  const order = (url.searchParams.get("order") ?? "").replace(/[^A-Z0-9-]/gi, "");
  return NextResponse.redirect(new URL(`/checkout/complete?order=${order}`, url.origin), 303);
}
export const GET = back;
export const POST = back;
