import Link from "next/link";
import { listMemberships, listOrders, listProducts, listUsers } from "@/lib/repo";
import { isMembershipActive } from "@/lib/access";
import { fmtDate, STATUS_LABEL, won } from "@/lib/format";

const kstDay = (iso: string) => new Date(new Date(iso).getTime() + 9 * 3600_000).toISOString().slice(0, 10);

export default async function Dashboard() {
  const [orders, products, memberships, users] = await Promise.all([listOrders(), listProducts(), listMemberships(), listUsers()]);
  const paid = orders.filter((o) => o.payment_status === "PAID");
  const today = kstDay(new Date().toISOString());
  const month = today.slice(0, 7);
  const sum = (xs: typeof paid) => xs.reduce((a, o) => a + o.amount, 0);
  const todayRev = sum(paid.filter((o) => o.paid_at && kstDay(o.paid_at) === today));
  const monthRev = sum(paid.filter((o) => o.paid_at && kstDay(o.paid_at).startsWith(month)));
  const activeMembers = memberships.filter(isMembershipActive).length;
  const singles = paid.filter((o) => o.order_type === "SINGLE").length;
  const userById = new Map(users.map((u) => [u.id, u]));
  const productById = new Map(products.map((p) => [p.id, p]));

  const stats = [
    ["오늘 매출", won(todayRev)],
    ["이번달 매출", won(monthRev)],
    ["멤버십 회원", `${activeMembers}명`],
    ["단품 구매", `${singles}건`],
    ["전체 주문", `${orders.length}건`],
    ["전체 상품", `${products.filter((p) => p.status !== "ARCHIVED").length}개`],
  ];

  return (
    <div>
      <h1 className="text-[24px] font-semibold text-ink">대시보드</h1>
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map(([k, v]) => (
          <div key={k} className="rounded-2xl border border-line bg-white p-5">
            <div className="text-[12.5px] text-sub">{k}</div>
            <div className="mt-2 text-[22px] font-semibold text-ink">{v}</div>
          </div>
        ))}
      </div>
      <div className="mt-10 flex items-center justify-between">
        <h2 className="text-[17px] font-semibold text-ink">최근 결제</h2>
        <Link href="/admin/orders" className="text-[13px] font-semibold text-ink underline">전체 주문</Link>
      </div>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full min-w-[640px] text-left text-[13.5px]">
          <thead className="bg-parchment text-[12px] text-sub"><tr><th className="px-4 py-3">결제일시</th><th>주문번호</th><th>구매자</th><th>상품</th><th>금액</th><th>상태</th></tr></thead>
          <tbody className="divide-y divide-line">
            {paid.slice(0, 10).map((o) => (
              <tr key={o.id}>
                <td className="px-4 py-3">{fmtDate(o.paid_at, true)}</td>
                <td className="font-mono text-[12.5px]">{o.order_number}</td>
                <td>{userById.get(o.user_id)?.name} <span className="text-sub">{userById.get(o.user_id)?.email}</span></td>
                <td>{o.order_type === "MEMBERSHIP" ? "MEMBERSHIP" : productById.get(o.product_id ?? "")?.title}</td>
                <td className="font-semibold">{won(o.amount)}</td>
                <td>{STATUS_LABEL[o.payment_status]}</td>
              </tr>
            ))}
            {paid.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-sub">아직 결제 내역이 없습니다.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
