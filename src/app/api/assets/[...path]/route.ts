import path from "node:path";
import { readLocalFile } from "@/lib/storage";

const TYPES: Record<string, string> = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif", ".svg": "image/svg+xml" };

/** 데모 모드 공개 이미지 */
export async function GET(_: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const p = (await params).path.join("/");
  const buf = (() => { try { return readLocalFile("public", p); } catch { return null; } })();
  if (!buf) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(buf), {
    headers: { "content-type": TYPES[path.extname(p).toLowerCase()] ?? "application/octet-stream", "cache-control": "public, max-age=31536000, immutable" },
  });
}
