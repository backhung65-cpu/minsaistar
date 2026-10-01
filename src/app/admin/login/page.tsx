import { redirect } from "next/navigation";
import { adminPassword, hasAppSecret } from "@/lib/config";
import { isAdmin } from "@/lib/session";
import { Logo } from "@/components/Header";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "ADMIN", robots: { index: false } };

export default async function AdminLogin() {
  if (await isAdmin()) redirect("/admin");
  const configured = Boolean(adminPassword()) && hasAppSecret();
  return (
    <div className="flex min-h-screen items-center justify-center bg-navy px-5">
      <div className="w-full max-w-sm rounded-[22px] bg-white p-8">
        <Logo />
        <div className="mt-1 text-[12px] font-bold tracking-[0.2em] text-sub">ADMIN</div>
        <div className="mt-8">
          {configured ? <LoginForm /> : <p className="text-[14px] text-red-700">Vercel 환경변수에 ADMIN_PASSWORD와 APP_SECRET(16자 이상)을 설정한 뒤 다시 배포해 주세요.</p>}
        </div>
        {process.env.NODE_ENV !== "production" && !process.env.ADMIN_PASSWORD && <p className="mt-4 text-[12.5px] text-sub">데모 모드 기본 비밀번호: <b>admin</b></p>}
      </div>
    </div>
  );
}
