import type { Metadata } from "next";
import Link from "next/link";
import { listOrdersByUser, listProducts } from "@/lib/repo";
import { getSessionUser } from "@/lib/session";
import { getAccess } from "@/lib/access";
import { fmtDate, STATUS_LABEL, won } from "@/lib/format";
import { logout } from "../access/actions";
import { cancelMembership } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "MY CONTENT", robots: { index: false } };

export default async function MyContent() {
  const su = await getSessionUser();
  if (!su) {
    return (
      <section className="container-x max-w-xl py-20 text-center">
        <div className="eyebrow">MY CONTENT</div>
        <h1 className="mt-3 text-[28px] font-semibold text-ink">내 콘텐츠</h1>
        <p className="mt-3 text-sub">구매하신 이메일로 인증하면 구매 자료를 바로 열 수 있습니다.</p>
        <Link href="/access" className="btn-primary mt-8 px-10">이메일 인증하기</Link>
      </section>
    );
  }
  const { session, user } = su;
  const [access, products, orders] = await Promise.all([getAccess(session), listProducts(), listOrdersByUser(user.id)]);
  const owned = products.filter((p) => access.ownedProductIds.has(p.id) && p.status !== "ARCHIVED");
  const m = access.membership;
  const visibleOrders = session.verified ? orders : orders.filter((o) => session.orders.includes(o.id));
  const productTitle = new Map(products.map((p) => [p.id, p.title]));

  return (
    <section className="container-x py-12 md:py-16">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="eyebrow">MY CONTENT</div>
          <h1 className="mt-3 text-[30px] font-semibold text-ink">내 콘텐츠</h1>
          <p className="mt-2 text-[14px] text-sub">{user.name || user.email} 님 · {user.email}</p>
        </div>
        <form action={logout}><button className="btn-outline btn-sm">로그아웃</button></form>
      </div>
      {!session.verified && (
        <p className="mt-6 rounded-xl border border-line bg-white px-4 py-3 text-[13.5px] text-sub">
          현재 이 브라우저에서 결제한 콘텐츠만 표시됩니다. 전체 구매 내역은 <Link href="/access" className="font-semibold text-ink underline">이메일 인증</Link> 후 확인할 수 있습니다.
        </p>
      )}

      {m && (
        <div className="mt-8 rounded-[18px] bg-tile p-6 text-white md:p-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <div className="eyebrow !text-muted-dark">MIRACLE MEMBERSHIP</div>
              <div className="mt-3 flex items-center gap-3">
                <span className={`badge ${access.membershipActive ? "bg-accent text-white" : "bg-white/10 text-white"}`}>
                  {access.membershipActive ? (m.status === "CANCELLED" ? "해지 예약" : "활성") : "만료"}
                </span>
                <span className="text-[14px] text-muted-dark">
                  {m.status === "ACTIVE" && m.next_payment_at ? `다음 결제일 ${fmtDate(m.next_payment_at)}` : `이용 기간 ${fmtDate(m.expired_at)}까지`}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {access.membershipActive ? (
                <>
                  <Link href="/library" className="btn-gold btn-sm">전체 라이브러리</Link>
                  <Link href="/library#updated" className="btn-sm btn border border-accent-dark text-accent-dark">최근 업데이트</Link>
                </>
              ) : (
                <Link href="/checkout?plan=membership" className="btn-gold btn-sm">멤버십 다시 시작</Link>
              )}
            </div>
          </div>
          {m.status === "ACTIVE" && session.verified && (
            <form action={cancelMembership} className="mt-6 border-t border-white/10 pt-4 text-right">
              <button className="text-[12px] text-accent-dark hover:underline">멤버십 해지 (결제 기간 종료일까지 이용 가능)</button>
            </form>
          )}
        </div>
      )}

      <div className="mt-10">
        <h2 className="text-[19px] font-semibold text-ink">구매한 프롬프트</h2>
        {owned.length ? (
          <ul className="mt-4 grid gap-4 md:grid-cols-2">
            {owned.map((p) => (
              <li key={p.id} className="card flex flex-col gap-4 !p-6">
                <div>
                  <div className="text-[12px] text-sub">Version {p.version}</div>
                  <div className="mt-1 text-[18px] font-semibold text-ink">{p.title}</div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/viewer/${p.slug}`} className="btn-primary btn-sm">프롬프트 열기</Link>
                  <Link href={`/viewer/${p.slug}#files`} className="btn-outline btn-sm">자료 다운로드</Link>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 rounded-2xl border border-dashed border-line p-8 text-center text-[14px] text-sub">
            단품으로 구매한 프롬프트가 없습니다. {access.membershipActive && "멤버십 라이브러리에서 전체 콘텐츠를 이용하세요."}
          </p>
        )}
      </div>

      {visibleOrders.length > 0 && (
        <div className="mt-12">
          <h2 className="text-[19px] font-semibold text-ink">주문 내역</h2>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-white">
            <table className="w-full min-w-[560px] text-left text-[14px]">
              <thead className="bg-parchment text-[12.5px] text-sub"><tr><th className="px-5 py-3">주문번호</th><th>상품</th><th>금액</th><th>상태</th><th>일시</th></tr></thead>
              <tbody className="divide-y divide-line">
                {visibleOrders.map((o) => (
                  <tr key={o.id}>
                    <td className="px-5 py-3 font-mono text-[13px]">{o.order_number}</td>
                    <td>{o.order_type === "MEMBERSHIP" ? "MIRACLE MEMBERSHIP" : productTitle.get(o.product_id ?? "") ?? "-"}</td>
                    <td>{won(o.amount)}</td>
                    <td>{STATUS_LABEL[o.payment_status]}</td>
                    <td className="text-sub">{fmtDate(o.paid_at ?? o.created_at, true)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
