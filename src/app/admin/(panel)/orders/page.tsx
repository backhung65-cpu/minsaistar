import Link from "next/link";
import { listOrders, listProducts, listUsers } from "@/lib/repo";
import { fmtDate, STATUS_LABEL, won } from "@/lib/format";
import { cancelOrderAction } from "../actions";

const FILTERS = ["ALL", "PAID", "PENDING", "FAILED", "CANCELLED", "REFUNDED"];

export default async function AdminOrders({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const { status = "ALL", q = "" } = await searchParams;
  const [orders, users, products] = await Promise.all([listOrders(), listUsers(), listProducts()]);
  const userById = new Map(users.map((u) => [u.id, u]));
  const productById = new Map(products.map((p) => [p.id, p]));
  const k = q.trim().toLowerCase();
  const list = orders.filter((o) => {
    if (status !== "ALL" && o.payment_status !== status) return false;
    if (!k) return true;
    const u = userById.get(o.user_id);
    return `${o.order_number} ${u?.email} ${u?.name} ${u?.phone}`.toLowerCase().includes(k);
  });

  return (
    <div>
      <h1 className="text-[24px] font-semibold text-ink">주문 관리</h1>
      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((s) => (
            <Link key={s} href={`/admin/orders?status=${s}${q ? `&q=${encodeURIComponent(q)}` : ""}`} className={`btn-sm btn border ${status === s ? "border-ink bg-ink text-white" : "border-line bg-white text-ink"}`}>
              {s === "ALL" ? "전체" : STATUS_LABEL[s]}
            </Link>
          ))}
        </div>
        <form className="md:ml-auto">
          <input type="hidden" name="status" value={status} />
          <input name="q" defaultValue={q} placeholder="주문번호 · 이메일 · 이름 · 전화번호" className="input !py-2 md:w-72" />
        </form>
      </div>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full min-w-[900px] text-left text-[13px]">
          <thead className="bg-parchment text-[12px] text-sub">
            <tr><th className="px-4 py-3">주문일시</th><th>주문번호</th><th>구매자</th><th>상품</th><th>금액</th><th>PayApp</th><th>상태</th><th></th></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {list.map((o) => {
              const u = userById.get(o.user_id);
              return (
                <tr key={o.id}>
                  <td className="px-4 py-3">{fmtDate(o.created_at, true)}</td>
                  <td className="font-mono text-[12px]">{o.order_number}</td>
                  <td>{u?.name}<div className="text-[12px] text-sub">{u?.email} · {u?.phone}</div></td>
                  <td>{o.order_type === "MEMBERSHIP" ? "MEMBERSHIP" : productById.get(o.product_id ?? "")?.title}</td>
                  <td className="font-semibold">{won(o.amount)}</td>
                  <td className="font-mono text-[11.5px] text-sub">{o.payment_id ?? "-"}{o.rebill_id && <div>R:{o.rebill_id}</div>}</td>
                  <td>
                    <span className={`badge ${o.payment_status === "PAID" ? "bg-emerald-50 text-emerald-700" : o.payment_status === "PENDING" ? "bg-parchment text-accent" : "bg-parchment text-sub"}`}>{STATUS_LABEL[o.payment_status]}</span>
                    {o.paid_at && <div className="mt-1 text-[11.5px] text-sub">{fmtDate(o.paid_at, true)}</div>}
                  </td>
                  <td className="pr-4 text-right">
                    {o.payment_status === "PAID" && (
                      <form action={cancelOrderAction}>
                        <input type="hidden" name="id" value={o.id} />
                        <button className="text-[12px] text-red-700 underline" title="PayApp 결제 취소는 PayApp 관리자에서 진행 후 권한만 회수합니다">권한 회수/환불처리</button>
                      </form>
                    )}
                  </td>
                </tr>
              );
            })}
            {list.length === 0 && <tr><td colSpan={8} className="p-10 text-center text-sub">주문이 없습니다.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
