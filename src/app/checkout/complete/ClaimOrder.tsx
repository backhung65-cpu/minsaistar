"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { claimOrder } from "../actions";

/** 결제 확정을 서버 DB에서 확인될 때까지 확인하고, 확정되면 이 브라우저에 구매권한을 연결 */
export function ClaimOrder({ orderNumber, waiting }: { orderNumber: string; waiting: boolean }) {
  const router = useRouter();
  const [tries, setTries] = useState(0);
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return;
    const t = setTimeout(async () => {
      const r = await claimOrder(orderNumber);
      if (r.status === "CLAIMED" || r.status === "PAID") {
        done.current = true;
        router.refresh();
      } else if (["FAILED", "CANCELLED", "REFUNDED", "FORBIDDEN", "NOT_FOUND"].includes(r.status)) {
        done.current = true;
        router.refresh();
      } else if (tries < 40) setTries((n) => n + 1);
    }, tries === 0 ? 300 : 2500);
    return () => clearTimeout(t);
  }, [orderNumber, tries, router]);

  if (!waiting) return null;
  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <span className="size-10 animate-spin rounded-full border-4 border-line border-t-navy" />
      <p className="text-[15px] text-sub">{tries < 40 ? "PayApp 결제 결과를 확인하고 있습니다..." : "결제 확인이 지연되고 있습니다. 잠시 후 새로고침해 주세요."}</p>
    </div>
  );
}
