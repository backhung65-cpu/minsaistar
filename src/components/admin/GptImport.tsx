"use client";
import { useActionState } from "react";
import { importGptAction, type ImportState } from "@/app/admin/(panel)/actions";

/** 기존 'AI 비서 100' 멤버십의 content/solutions.json 을 GPT 상품으로 가져오기 */
export function GptImport() {
  const [state, action, pending] = useActionState<ImportState, FormData>(importGptAction, {});
  return (
    <details className="card mt-6 !p-6">
      <summary className="cursor-pointer text-[15px] font-semibold text-ink">GPT 솔루션 가져오기 (AI 비서 100 · solutions.json)</summary>
      <form action={action} className="mt-4 space-y-3">
        <p className="text-[13px] text-sub">
          기존 멤버십 저장소의 <code>content/solutions.json</code> 파일을 올리면 GPT 솔루션이 멤버십 전용 상품으로 등록됩니다.
          같은 번호는 덮어쓰므로 목록이 바뀔 때마다 다시 올리면 됩니다. GPT 주소는 DB에만 저장되고 결제한 회원에게만 보입니다.
        </p>
        <input type="file" name="file" accept="application/json,.json" className="block text-[13px]" />
        <textarea name="json" rows={4} className="input font-mono text-[12px]" placeholder="또는 JSON 내용을 붙여 넣기" />
        {state.error && <p className="text-[13px] text-red-700">{state.error}</p>}
        {state.message && <p className="text-[13px] text-emerald-700">✓ {state.message}</p>}
        <button disabled={pending} className="btn-primary btn-sm">{pending ? "가져오는 중..." : "가져오기"}</button>
      </form>
    </details>
  );
}
