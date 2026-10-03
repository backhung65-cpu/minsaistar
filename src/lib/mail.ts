import "server-only";
import { env } from "@/lib/config";

export const canSendMail = () => Boolean(env.resendKey);

export async function sendMail(to: string, subject: string, html: string): Promise<boolean> {
  if (!env.resendKey) return false;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${env.resendKey}`, "content-type": "application/json" },
    body: JSON.stringify({ from: env.mailFrom, to, subject, html }),
  });
  return res.ok;
}

export function accessCodeMail(code: string) {
  return `<div style="font-family:Pretendard,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#F7F5EF;color:#242424">
  <div style="font-weight:800;letter-spacing:.2em;color:#1d1d1f">MIRACLE PROMPT</div>
  <p style="margin-top:24px">구매 자료 접근을 위한 인증코드입니다.</p>
  <div style="font-size:32px;font-weight:800;letter-spacing:.3em;color:#1d1d1f;background:#fff;border:1px solid #E8E6DF;border-radius:16px;padding:20px;text-align:center">${code}</div>
  <p style="color:#737373;font-size:13px">인증코드는 10분간 유효합니다. 본인이 요청하지 않았다면 이 메일을 무시해 주세요.</p>
</div>`;
}
