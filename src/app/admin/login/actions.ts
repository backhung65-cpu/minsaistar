"use server";
import { redirect } from "next/navigation";
import { adminLogin, adminLogout } from "@/lib/session";

export async function login(_: { error?: string }, form: FormData): Promise<{ error?: string }> {
  await new Promise((r) => setTimeout(r, 400)); // 무차별 대입 완화
  if (!(await adminLogin(String(form.get("password") ?? "")))) return { error: "비밀번호가 올바르지 않습니다." };
  redirect("/admin");
}

export async function logoutAdmin() {
  await adminLogout();
  redirect("/admin/login");
}
