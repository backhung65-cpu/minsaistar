import { listMemberships, listUsers } from "@/lib/repo";
import { isMembershipActive } from "@/lib/access";
import { fmtDate, STATUS_LABEL } from "@/lib/format";

export default async function AdminMembers() {
  const [memberships, users] = await Promise.all([listMemberships(), listUsers()]);
  const userById = new Map(users.map((u) => [u.id, u]));
  const list = memberships.sort((a, b) => b.started_at.localeCompare(a.started_at));
  return (
    <div>
      <h1 className="text-[24px] font-extrabold text-navy">멤버십 회원</h1>
      <p className="mt-1 text-[13.5px] text-sub">활성 {list.filter(isMembershipActive).length}명 / 전체 {list.length}명</p>
      <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full min-w-[720px] text-left text-[13.5px]">
          <thead className="bg-ivory text-[12px] text-sub"><tr><th className="px-4 py-3">회원</th><th>상태</th><th>시작일</th><th>이용 기간</th><th>다음 결제일</th><th>정기결제번호</th></tr></thead>
          <tbody className="divide-y divide-line">
            {list.map((m) => {
              const u = userById.get(m.user_id);
              const active = isMembershipActive(m);
              return (
                <tr key={m.id}>
                  <td className="px-4 py-3">{u?.name}<div className="text-[12px] text-sub">{u?.email} · {u?.phone}</div></td>
                  <td><span className={`badge ${active ? "bg-emerald-50 text-emerald-700" : "bg-ivory-2 text-sub"}`}>{active ? (m.status === "CANCELLED" ? "해지예약" : "활성") : STATUS_LABEL[m.status] ?? m.status}</span></td>
                  <td>{fmtDate(m.started_at)}</td>
                  <td>{fmtDate(m.expired_at)}까지</td>
                  <td>{fmtDate(m.next_payment_at)}</td>
                  <td className="font-mono text-[12px] text-sub">{m.rebill_id ?? "-"}</td>
                </tr>
              );
            })}
            {list.length === 0 && <tr><td colSpan={6} className="p-10 text-center text-sub">멤버십 회원이 없습니다.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
