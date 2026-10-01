"use client";
import Link from "next/link";
import { useActionState } from "react";
import { startCheckout, type CheckoutState } from "./actions";

export function CheckoutForm({ plan, product, cta }: { plan?: string; product?: string; cta: string }) {
  const [state, action, pending] = useActionState<CheckoutState, FormData>(startCheckout, {});
  return (
    <form action={action} className="space-y-5">
      {plan && <input type="hidden" name="plan" value={plan} />}
      {product && <input type="hidden" name="product" value={product} />}
      <div>
        <label className="label" htmlFor="name">이름</label>
        <input id="name" name="name" className="input" autoComplete="name" required placeholder="홍길동" />
      </div>
      <div>
        <label className="label" htmlFor="phone">휴대전화</label>
        <input id="phone" name="phone" className="input" inputMode="tel" autoComplete="tel" required placeholder="010-0000-0000" />
        <p className="mt-1.5 text-[12.5px] text-sub">PayApp 결제 요청 및 결제 확인에 사용됩니다.</p>
      </div>
      <div>
        <label className="label" htmlFor="email">이메일</label>
        <input id="email" name="email" type="email" className="input" autoComplete="email" required placeholder="you@example.com" />
        <p className="mt-1.5 text-[12.5px] text-sub">다른 기기에서 구매 자료를 다시 열 때 이 이메일로 인증합니다.</p>
      </div>
      <label className="flex items-start gap-3 rounded-xl bg-ivory p-4 text-[13.5px] leading-relaxed">
        <input type="checkbox" name="agree" className="mt-1 size-4 accent-[#152238]" required />
        <span>
          <Link href="/terms" target="_blank" className="font-semibold underline">이용약관 · 환불 정책</Link>,{" "}
          <Link href="/license" target="_blank" className="font-semibold underline">라이선스</Link>,{" "}
          <Link href="/privacy" target="_blank" className="font-semibold underline">개인정보 수집·이용</Link>에 동의합니다.
          디지털 콘텐츠 특성상 열람·다운로드 후에는 환불이 제한됩니다.
        </span>
      </label>
      {state.error && <p className="rounded-xl bg-red-50 px-4 py-3 text-[14px] font-medium text-red-700">{state.error}</p>}
      <button type="submit" disabled={pending} className="btn-primary w-full py-4 text-[16px]">
        {pending ? "결제창으로 이동 중..." : cta}
      </button>
    </form>
  );
}
