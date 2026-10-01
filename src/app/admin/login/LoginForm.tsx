"use client";
import { useActionState } from "react";
import { login } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, {});
  return (
    <form action={action} className="space-y-4">
      <input name="password" type="password" required autoFocus className="input" placeholder="관리자 비밀번호" />
      {state.error && <p className="text-[14px] text-red-700">{state.error}</p>}
      <button disabled={pending} className="btn-primary w-full">로그인</button>
    </form>
  );
}
