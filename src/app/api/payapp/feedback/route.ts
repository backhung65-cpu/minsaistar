import { processPayAppFeedback } from "@/lib/payments";

/**
 * PayApp 결제 결과 서버 통보 (feedbackurl)
 * 검증에 성공하면 "SUCCESS"를 응답해야 PayApp이 재전송하지 않는다.
 */
export async function POST(req: Request) {
  const text = await req.text();
  const params = Object.fromEntries(new URLSearchParams(text));
  try {
    const r = await processPayAppFeedback(params);
    if (!r.ok) {
      console.warn("[payapp] feedback rejected:", r.error, params.var1, params.mul_no);
      return new Response("FAIL", { status: 400 });
    }
    return new Response("SUCCESS", { headers: { "content-type": "text/plain" } });
  } catch (e) {
    console.error("[payapp] feedback error", e);
    return new Response("FAIL", { status: 500 });
  }
}
