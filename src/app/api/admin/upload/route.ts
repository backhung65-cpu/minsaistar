import { verifyToken } from "@/lib/crypto";
import { isAdmin } from "@/lib/session";
import { writeLocalFile, type Bucket } from "@/lib/storage";

/** 데모 모드 업로드 (운영 모드에서는 Supabase Signed Upload URL로 직접 업로드) */
export async function PUT(req: Request) {
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401 });
  const data = verifyToken<{ b: Bucket; p: string }>(new URL(req.url).searchParams.get("token"));
  if (!data) return new Response("Invalid token", { status: 403 });
  writeLocalFile(data.b, data.p, Buffer.from(await req.arrayBuffer()));
  return Response.json({ ok: true });
}
