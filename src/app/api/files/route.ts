import { verifyToken } from "@/lib/crypto";
import { readLocalFile } from "@/lib/storage";

/** 데모 모드 로컬 파일 Signed URL 처리 */
export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token");
  const data = verifyToken<{ p: string; n: string }>(token);
  if (!data) return new Response("Link expired", { status: 403 });
  const buf = readLocalFile("private", data.p);
  if (!buf) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(buf), {
    headers: {
      "content-type": "application/octet-stream",
      "content-disposition": `attachment; filename*=UTF-8''${encodeURIComponent(data.n)}`,
      "cache-control": "private, no-store",
    },
  });
}
