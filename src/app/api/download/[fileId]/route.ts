import { NextResponse } from "next/server";
import { getProduct, getProductFile, logDownload } from "@/lib/repo";
import { getSession, isAdmin } from "@/lib/session";
import { canAccess, getAccess } from "@/lib/access";
import { createSignedDownloadUrl } from "@/lib/storage";

/** 다운로드: 구매권한 확인 → 임시(Signed) URL 생성 → 리다이렉트. 파일 원본 경로는 노출하지 않는다. */
export async function GET(req: Request, { params }: { params: Promise<{ fileId: string }> }) {
  const { fileId } = await params;
  const file = await getProductFile(fileId);
  if (!file) return new NextResponse("Not found", { status: 404 });
  const product = await getProduct(file.product_id);
  if (!product) return new NextResponse("Not found", { status: 404 });

  const session = await getSession();
  const admin = await isAdmin();
  const allowed = admin || canAccess(await getAccess(session), product);
  if (!allowed) return NextResponse.redirect(new URL(`/prompts/${product.slug}`, req.url));

  if (session) {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
    await logDownload({ user_id: session.uid, product_id: product.id, file_id: file.id, ip });
  }
  const url = await createSignedDownloadUrl(file.storage_path, file.file_name, 60);
  return NextResponse.redirect(new URL(url, req.url), 302);
}
