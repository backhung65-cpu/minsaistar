import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/session";
import { isDemo, isMockPayment, isPayAppLive } from "@/lib/config";
import { Logo } from "@/components/Header";
import { logoutAdmin } from "../login/actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "ADMIN", robots: { index: false } };

const NAV = [
  { href: "/admin", label: "대시보드" },
  { href: "/admin/products", label: "상품 관리" },
  { href: "/admin/orders", label: "주문 관리" },
  { href: "/admin/members", label: "멤버십 회원" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) redirect("/admin/login");
  return (
    <div className="min-h-screen bg-parchment md:grid md:grid-cols-[250px_1fr]">
      <aside className="bg-tile p-5 text-white md:min-h-screen">
        <Link href="/admin"><Logo light /></Link>
        <div className="mt-1 text-[11px] font-semibold tracking-[0.2em] text-white/40">ADMIN</div>
        <nav className="mt-6 flex gap-1 overflow-x-auto md:flex-col">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="shrink-0 rounded-lg px-3 py-2 text-[14px] text-white/80 hover:bg-white/10 hover:text-white">{n.label}</Link>
          ))}
          <Link href="/" target="_blank" className="shrink-0 rounded-lg px-3 py-2 text-[14px] text-white/50 hover:bg-white/10">사이트 보기 ↗</Link>
        </nav>
        <form action={logoutAdmin} className="mt-6 hidden md:block"><button className="text-[12.5px] text-white/50 underline">로그아웃</button></form>
        <div className="mt-8 hidden space-y-1 text-[11.5px] text-white/40 md:block">
          <div>DB: {isDemo ? "로컬 데모(.data)" : "Supabase"}</div>
          <div>결제: {isPayAppLive ? "PayApp 운영" : isMockPayment ? "모의 결제" : "비활성 (PayApp 미설정)"}</div>
        </div>
      </aside>
      <div className="min-w-0 p-5 md:p-10">{children}</div>
    </div>
  );
}
