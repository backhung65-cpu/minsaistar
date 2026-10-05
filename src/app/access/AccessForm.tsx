"use client";
import { useActionState } from "react";
import { requestCode, verifyCode, type AccessState } from "./actions";

export function AccessForm({ next }: { next?: string }) {
  const [reqState, reqAction, reqPending] = useActionState<AccessState, FormData>(requestCode, { step: "email" });
  const [verState, verAction, verPending] = useActionState<AccessState, FormData>(verifyCode, { step: "code" });
  const step = reqState.step;
  const email = reqState.email ?? "";

  if (step === "email") {
    return (
      <form action={reqAction} className="space-y-4">
        <div>
          <label className="label" htmlFor="email">구매 시 입력한 이메일</label>
          <input id="email" name="email" type="email" required className="input" placeholder="you@example.com" />
        </div>
        {reqState.error && <p className="rounded-xl bg-red-50 px-4 py-3 text-[14px] text-red-700">{reqState.error}</p>}
        <button disabled={reqPending} className="btn-primary w-full py-4">{reqPending ? "요청 중..." : "인증코드 받기"}</button>
      </form>
    );
  }
  return (
    <form action={verAction} className="space-y-4">
      <input type="hidden" name="email" value={email} />
      {next && <input type="hidden" name="next" value={next} />}
      <p className="text-[14px] text-sub"><b className="text-ink">{email}</b> 으로 발송된 6자리 코드를 입력해 주세요.</p>
      {reqState.info && <p className="rounded-xl bg-parchment px-4 py-3 text-[13.5px] text-sub">{reqState.info}</p>}
      {reqState.devCode && <p className="rounded-xl border border-accent/40 bg-parchment px-4 py-3 text-[14px] text-ink">인증코드: <b className="font-mono tracking-[0.3em]">{reqState.devCode}</b></p>}
      <input name="code" inputMode="numeric" maxLength={6} required autoFocus className="input text-center font-mono text-[22px] tracking-[0.5em]" placeholder="000000" />
      {verState.error && <p className="rounded-xl bg-red-50 px-4 py-3 text-[14px] text-red-700">{verState.error}</p>}
      <button disabled={verPending} className="btn-primary w-full py-4">{verPending ? "확인 중..." : "인증하고 구매 자료 열기"}</button>
    </form>
  );
}
