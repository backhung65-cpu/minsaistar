"use server";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/session";
import { adminCancelOrder } from "@/lib/payments";
import {
  addProductFile, deleteProduct, deleteProductFileRow, getOrder, getProduct, getProductFile,
  saveProduct, seedSampleProduct, type ProductInput,
} from "@/lib/repo";
import { createUploadUrl, publicUrl, removeObject, sanitizeFileName } from "@/lib/storage";
import type { Badge, ChangelogEntry, FaqItem, ProductStatus, ProductType } from "@/lib/types";

async function guard() {
  if (!(await isAdmin())) throw new Error("Unauthorized");
}

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const lines = (s: string) => s.split("\n").map((l) => l.trim()).filter(Boolean);
const blocks = (s: string) => s.replace(/\r/g, "").split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);

function parseFaq(s: string): FaqItem[] {
  return blocks(s).map((b) => {
    const [q, ...a] = b.split("\n");
    return { q: q.replace(/^Q[.:]\s*/i, "").trim(), a: a.join("\n").replace(/^A[.:]\s*/i, "").trim() };
  }).filter((f) => f.q);
}

function parseChangelog(s: string): ChangelogEntry[] {
  return blocks(s).map((b) => {
    const [head, ...rest] = b.split("\n");
    const [version, date] = head.split("|").map((x) => x.trim().replace(/^v/i, ""));
    return { version, date: date ?? "", notes: rest.map((l) => l.replace(/^[-·*]\s*/, "").trim()).filter(Boolean) };
  }).filter((c) => c.version);
}

export type SaveState = { error?: string; ok?: boolean };

export async function saveProductAction(_: SaveState, f: FormData): Promise<SaveState> {
  await guard();
  const id = str(f, "id") || undefined;
  const slug = str(f, "slug").toLowerCase();
  if (!str(f, "title")) return { error: "상품명을 입력해 주세요." };
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) return { error: "Slug는 영문 소문자, 숫자, 하이픈(-)만 사용할 수 있습니다." };

  const input: ProductInput = {
    id,
    title: str(f, "title"),
    slug,
    category_id: str(f, "category_id") || null,
    short_description: str(f, "short_description"),
    description: str(f, "description"),
    thumbnail: str(f, "thumbnail") || null,
    regular_price: Number(str(f, "regular_price").replace(/\D/g, "")) || 0,
    sale_price: Number(str(f, "sale_price").replace(/\D/g, "")) || 0,
    product_type: (str(f, "product_type") || "PROMPT") as ProductType,
    prompt_content: String(f.get("prompt_content") ?? ""),
    input_template: String(f.get("input_template") ?? ""),
    usage_example: String(f.get("usage_example") ?? ""),
    result_example: String(f.get("result_example") ?? ""),
    preview_content: String(f.get("preview_content") ?? ""),
    usage_guide: String(f.get("usage_guide") ?? ""),
    problems: lines(str(f, "problems")),
    use_cases: lines(str(f, "use_cases")),
    faq: parseFaq(str(f, "faq")),
    changelog: parseChangelog(str(f, "changelog")),
    badges: f.getAll("badges").map(String) as Badge[],
    package_product_ids: f.getAll("package_product_ids").map(String),
    membership_included: f.get("membership_included") === "on",
    status: (str(f, "status") || "DRAFT") as ProductStatus,
    version: str(f, "version") || "1.0",
    seo_title: str(f, "seo_title") || null,
    seo_description: str(f, "seo_description") || null,
    og_image: str(f, "og_image") || null,
    sort_order: Number(str(f, "sort_order")) || 0,
  };
  let saved;
  try {
    saved = await saveProduct(input);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "저장 중 오류가 발생했습니다." };
  }
  revalidatePath("/", "layout");
  if (!id) redirect(`/admin/products/${saved.id}?created=1`);
  return { ok: true };
}

export async function archiveProductAction(form: FormData) {
  await guard();
  await deleteProduct(String(form.get("id")));
  revalidatePath("/", "layout");
  redirect("/admin/products");
}

export async function seedSampleAction() {
  await guard();
  await seedSampleProduct();
  revalidatePath("/", "layout");
  redirect("/admin/products");
}

/* ───────── 파일 업로드 (브라우저 → Storage 직접 업로드) ───────── */

export async function requestFileUpload(productId: string, fileName: string) {
  await guard();
  const storagePath = `${productId}/${randomUUID().slice(0, 8)}-${sanitizeFileName(fileName)}`;
  return { uploadUrl: await createUploadUrl("private", storagePath), storagePath };
}

export async function registerFile(input: { productId: string; fileName: string; fileType: string; storagePath: string; size: number }) {
  await guard();
  if (!(await getProduct(input.productId))) throw new Error("상품 없음");
  if (!input.storagePath.startsWith(`${input.productId}/`)) throw new Error("invalid path");
  await addProductFile({
    product_id: input.productId, file_name: input.fileName, file_type: input.fileType.toUpperCase(),
    storage_path: input.storagePath, size_bytes: input.size,
  });
  revalidatePath(`/admin/products/${input.productId}`);
}

export async function deleteFileAction(form: FormData) {
  await guard();
  const file = await getProductFile(String(form.get("id")));
  if (!file) return;
  await removeObject("private", file.storage_path);
  await deleteProductFileRow(file.id);
  revalidatePath(`/admin/products/${file.product_id}`);
}

export async function requestImageUpload(fileName: string) {
  await guard();
  const storagePath = `images/${Date.now()}-${sanitizeFileName(fileName)}`;
  return { uploadUrl: await createUploadUrl("public", storagePath), publicUrl: publicUrl(storagePath) };
}

/* ───────── 주문 ───────── */

export async function cancelOrderAction(form: FormData) {
  await guard();
  const order = await getOrder(String(form.get("id")));
  if (order) await adminCancelOrder(order);
  revalidatePath("/admin/orders");
}
