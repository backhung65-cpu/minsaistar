import { redirect } from "next/navigation";
import { adminPassword, isDemo } from "@/lib/config";
import { isAdmin } from "@/lib/session";
import { Logo } from "@/components/Header";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "ADMIN", robots: { index: false } };

export default async function AdminLogin() {
  if (await isAdmin()) redirect("/admin");
  const configured = Boolean(adminPassword());
  return (
    <div className="flex min-h-screen items-center justify-center bg-navy px-5">
      <div className="w-full max-w-sm rounded-[22px] bg-white p-8">
        <Logo />
        <div className="mt-1 text-[12px] font-bold tracking-[0.2em] text-sub">ADMIN</div>
        <div className="mt-8">
          {configured ? <LoginForm /> : <p className="text-[14px] text-red-700">ADMIN_PASSWORD 환경변수를 설정해 주세요.</p>}
        </div>
        {isDemo && !process.env.ADMIN_PASSWORD && <p className="mt-4 text-[12.5px] text-sub">데모 모드 기본 비밀번호: <b>admin</b></p>}
      </div>
    </div>
  );
}
