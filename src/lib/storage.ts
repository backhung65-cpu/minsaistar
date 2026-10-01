import "server-only";
import fs from "node:fs";
import path from "node:path";
import { env, isSupabase } from "@/lib/config";
import { LOCAL_DATA_DIR, supabase } from "@/lib/db/adapter";
import { signToken } from "@/lib/crypto";

/**
 * 파일 저장소
 * - private: 상품 자료(ZIP/PDF/MD...). 공개 URL 없음, 권한 확인 후 Signed URL로만 다운로드.
 * - public : 썸네일 등 공개 이미지.
 */
export type Bucket = "private" | "public";

const bucketName = (b: Bucket) => (b === "private" ? env.storageBucket : env.publicBucket);
const localPath = (b: Bucket, p: string) => {
  const root = path.join(LOCAL_DATA_DIR, "files", b);
  const full = path.resolve(root, p);
  if (!full.startsWith(root + path.sep)) throw new Error("invalid path");
  return full;
};

export function sanitizeFileName(name: string): string {
  const ext = path.extname(name).toLowerCase().replace(/[^a-z0-9.]/g, "");
  const base = path.basename(name, path.extname(name)).replace(/[^\w\-가-힣]+/g, "-").slice(0, 60) || "file";
  return `${base}${ext}`;
}

/** 브라우저에서 직접 업로드할 URL (Vercel 요청 크기 제한 회피) */
export async function createUploadUrl(bucket: Bucket, storagePath: string): Promise<string> {
  if (isSupabase) {
    const { data, error } = await supabase().storage.from(bucketName(bucket)).createSignedUploadUrl(storagePath);
    if (error || !data) throw new Error(error?.message || "upload url error");
    return data.signedUrl;
  }
  const token = signToken({ b: bucket, p: storagePath, exp: Date.now() + 10 * 60_000 });
  return `/api/admin/upload?token=${encodeURIComponent(token)}`;
}

export function writeLocalFile(bucket: Bucket, storagePath: string, data: Buffer) {
  const full = localPath(bucket, storagePath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, data);
}

export function readLocalFile(bucket: Bucket, storagePath: string): Buffer | null {
  const full = localPath(bucket, storagePath);
  return fs.existsSync(full) ? fs.readFileSync(full) : null;
}

/** 임시 다운로드 URL (기본 60초) */
export async function createSignedDownloadUrl(storagePath: string, fileName: string, seconds = 60): Promise<string> {
  if (isSupabase) {
    const { data, error } = await supabase()
      .storage.from(bucketName("private"))
      .createSignedUrl(storagePath, seconds, { download: fileName });
    if (error || !data) throw new Error(error?.message || "signed url error");
    return data.signedUrl;
  }
  const token = signToken({ p: storagePath, n: fileName, exp: Date.now() + seconds * 1000 });
  return `/api/files?token=${encodeURIComponent(token)}`;
}

export function publicUrl(storagePath: string): string {
  if (isSupabase) return supabase().storage.from(bucketName("public")).getPublicUrl(storagePath).data.publicUrl;
  return `/api/assets/${storagePath}`;
}

export async function removeObject(bucket: Bucket, storagePath: string) {
  if (isSupabase) {
    await supabase().storage.from(bucketName(bucket)).remove([storagePath]);
    return;
  }
  try {
    fs.unlinkSync(localPath(bucket, storagePath));
  } catch {
    /* noop */
  }
}
