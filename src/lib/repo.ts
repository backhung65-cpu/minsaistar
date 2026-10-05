import "server-only";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db/adapter";
import { isDemo } from "@/lib/config";
import { randomHex } from "@/lib/crypto";
import { sampleFiles, sampleProduct } from "@/content/sample-product";
import type {
  Badge, Category, Entitlement, Membership, Order, OrderType, Product, ProductFile, User,
} from "@/lib/types";

const now = () => new Date().toISOString();

export const DEFAULT_CATEGORIES: Omit<Category, "id">[] = [
  { slug: "marketing", name: "마케팅", sort_order: 1 },
  { slug: "publishing", name: "출판·글쓰기", sort_order: 2 },
  { slug: "research", name: "연구·학습", sort_order: 3 },
  { slug: "shortform", name: "숏폼·영상", sort_order: 4 },
  { slug: "image", name: "이미지·디자인", sort_order: 5 },
  { slug: "promotion", name: "홍보·브랜딩", sort_order: 6 },
  { slug: "business", name: "비즈니스·웹", sort_order: 7 },
];

/* ───────────────────────── 초기 데이터 ───────────────────────── */

let seeded = false;
async function ensureSeed() {
  if (seeded) return;
  seeded = true;
  const cats = await db.list("categories");
  if (cats.length === 0) {
    for (const c of DEFAULT_CATEGORIES) await db.insert("categories", { id: randomUUID(), ...c });
  }
  // 데모 모드에서는 샘플 상품을 자동 등록
  if (isDemo && (await db.list("products")).length === 0) await seedSampleProduct();
}

export async function seedSampleProduct() {
  if (await db.get("products", { slug: sampleProduct.slug })) return;
  const cats = await db.list("categories");
  const cat = cats.find((c) => c.slug === "marketing") ?? null;
  const product = await saveProduct({ ...sampleProduct, category_id: cat?.id ?? null });
  const { writeLocalFile, createUploadUrl } = await import("@/lib/storage");
  for (const f of sampleFiles) {
    const storagePath = `${product.id}/${f.file_name}`;
    const data = Buffer.from(f.content(), "utf8");
    if (isDemo) writeLocalFile("private", storagePath, data);
    else {
      const url = await createUploadUrl("private", storagePath);
      await fetch(url, { method: "PUT", body: data, headers: { "content-type": "text/plain; charset=utf-8" } });
    }
    await addProductFile({ product_id: product.id, file_name: f.file_name, file_type: f.file_type, storage_path: storagePath, size_bytes: data.length });
  }
}

/* ───────────────────────── 카테고리 ───────────────────────── */

export async function listCategories(): Promise<Category[]> {
  await ensureSeed();
  return (await db.list("categories")).sort((a, b) => a.sort_order - b.sort_order);
}

/* ───────────────────────── 상품 ───────────────────────── */

const byOrder = (a: Product, b: Product) =>
  a.sort_order - b.sort_order || b.created_at.localeCompare(a.created_at);

export async function listProducts(opts: { publishedOnly?: boolean } = {}): Promise<Product[]> {
  await ensureSeed();
  const rows = opts.publishedOnly ? await db.list("products", { status: "PUBLISHED" }) : await db.list("products");
  return rows.sort(byOrder);
}

export async function getProductBySlug(slug: string) {
  await ensureSeed();
  return db.get("products", { slug });
}

export async function getProduct(id: string) {
  await ensureSeed();
  return db.get("products", { id });
}

export type ProductInput = Omit<Product, "id" | "created_at" | "updated_at"> & { id?: string };

export async function saveProduct(input: ProductInput): Promise<Product> {
  const existingSlug = await db.get("products", { slug: input.slug });
  if (existingSlug && existingSlug.id !== input.id) throw new Error("이미 사용 중인 Slug입니다.");
  if (input.id) {
    const { id, ...patch } = input;
    return db.update("products", id, { ...patch, updated_at: now() });
  }
  return db.insert("products", { ...input, id: randomUUID(), created_at: now(), updated_at: now() } as Product);
}

export async function deleteProduct(id: string) {
  await db.update("products", id, { status: "ARCHIVED", updated_at: now() });
}

/* ───────────────────────── GPT 솔루션 가져오기 ───────────────────────── */

export interface GptSolutionInput {
  id: number;
  title: string;
  category: string;
  badge?: string;
  summary: string;
  output?: string;
  gpt?: string;
  cafe?: string;
}

const isHttpUrl = (u: unknown): u is string => typeof u === "string" && /^https:\/\/[^\s]+$/.test(u);

/**
 * 기존 'AI 비서 100' solutions.json 형식을 GPT 상품(멤버십 전용)으로 등록·갱신.
 * slug = gpt-{번호} 기준으로 같은 항목은 덮어쓴다. GPT 주소는 DB에만 저장된다.
 */
export async function importGptSolutions(items: GptSolutionInput[]): Promise<{ created: number; updated: number; skipped: string[] }> {
  await ensureSeed();
  const cats = await listCategories();
  const byName = new Map(cats.map((c) => [c.name, c.id]));
  const result = { created: 0, updated: 0, skipped: [] as string[] };
  const maxId = Math.max(0, ...items.map((i) => Number(i.id) || 0));

  for (const it of items) {
    const n = Number(it.id);
    if (!n || !it.title || !it.summary) { result.skipped.push(`#${it.id ?? "?"} 필수값 누락`); continue; }
    if (it.gpt && !isHttpUrl(it.gpt)) { result.skipped.push(`#${n} GPT 주소 형식 오류`); continue; }
    const slug = `gpt-${n}`;
    const existing = await db.get("products", { slug });
    const badges: Badge[] = n === maxId ? ["NEW"] : [];
    const input: ProductInput = {
      id: existing?.id,
      title: it.title,
      slug,
      category_id: byName.get(it.category) ?? null,
      short_description: it.summary,
      description: it.summary,
      thumbnail: existing?.thumbnail ?? null,
      regular_price: 0,
      sale_price: 0,
      product_type: "GPT",
      prompt_content: "",
      input_template: "",
      usage_example: "",
      result_example: "",
      preview_content: "",
      usage_guide: "",
      gpt_url: it.gpt ?? null,
      guide_url: isHttpUrl(it.cafe) ? it.cafe : null,
      output: it.output ?? "",
      problems: [],
      use_cases: [],
      faq: existing?.faq ?? [],
      changelog: existing?.changelog ?? [],
      badges,
      package_product_ids: [],
      membership_included: true,
      status: existing?.status ?? "PUBLISHED",
      version: existing?.version ?? "1.0",
      seo_title: existing?.seo_title ?? null,
      seo_description: existing?.seo_description ?? null,
      og_image: existing?.og_image ?? null,
      sort_order: 100 + n,
    };
    await saveProduct(input);
    if (existing) result.updated++; else result.created++;
  }
  return result;
}

/* ───────────────────────── 파일 ───────────────────────── */

export async function listProductFiles(productId: string): Promise<ProductFile[]> {
  return (await db.list("product_files", { product_id: productId })).sort((a, b) => a.created_at.localeCompare(b.created_at));
}

export async function listAllFiles(): Promise<ProductFile[]> {
  return db.list("product_files");
}

export const getProductFile = (id: string) => db.get("product_files", { id });

export async function addProductFile(f: Omit<ProductFile, "id" | "created_at">) {
  return db.insert("product_files", { ...f, id: randomUUID(), created_at: now() });
}

export const deleteProductFileRow = (id: string) => db.remove("product_files", id);

/* ───────────────────────── 사용자 ───────────────────────── */

export const normalizeEmail = (e: string) => e.trim().toLowerCase();

export async function upsertUser(input: { name: string; email: string; phone: string }): Promise<User> {
  const email = normalizeEmail(input.email);
  const found = await db.get("users", { email });
  if (found) {
    // 기존 정보는 덮어쓰지 않고, 비어 있는 값만 채움 (타인 정보 변조 방지)
    const patch: Partial<User> = {};
    if (!found.name && input.name) patch.name = input.name;
    if (!found.phone && input.phone) patch.phone = input.phone;
    return Object.keys(patch).length ? db.update("users", found.id, patch) : found;
  }
  return db.insert("users", { id: randomUUID(), name: input.name, email, phone: input.phone, created_at: now() });
}

export const getUser = (id: string) => db.get("users", { id });
export const getUserByEmail = (email: string) => db.get("users", { email: normalizeEmail(email) });
export const listUsers = () => db.list("users");

/* ───────────────────────── 주문 ───────────────────────── */

/** 내부 주문번호: MIR-YYYYMMDD-XXXXXX */
export function makeOrderNumber(d = new Date()) {
  const kst = new Date(d.getTime() + 9 * 3600_000);
  const ymd = kst.toISOString().slice(0, 10).replace(/-/g, "");
  return `MIR-${ymd}-${randomHex(3)}`;
}

export async function createOrder(input: {
  user_id: string; product_id: string | null; order_type: OrderType; amount: number;
}): Promise<Order> {
  return db.insert("orders", {
    id: randomUUID(),
    order_number: makeOrderNumber(),
    user_id: input.user_id,
    product_id: input.product_id,
    order_type: input.order_type,
    amount: input.amount,
    payment_provider: "PAYAPP",
    payment_id: null,
    rebill_id: null,
    payment_status: "PENDING",
    raw_payload: null,
    created_at: now(),
    paid_at: null,
  });
}

export const getOrderByNumber = (order_number: string) => db.get("orders", { order_number });
export const getOrder = (id: string) => db.get("orders", { id });
export const getOrderByPaymentId = (payment_id: string) => db.get("orders", { payment_id });
export const updateOrder = (id: string, patch: Partial<Order>) => db.update("orders", id, patch);

export async function listOrders(): Promise<Order[]> {
  return (await db.list("orders")).sort((a, b) => b.created_at.localeCompare(a.created_at));
}
export async function listOrdersByUser(user_id: string): Promise<Order[]> {
  return (await db.list("orders", { user_id })).sort((a, b) => b.created_at.localeCompare(a.created_at));
}

/* ───────────────────────── 권한 / 멤버십 ───────────────────────── */

export async function createEntitlement(e: Omit<Entitlement, "id">) {
  return db.insert("entitlements", { ...e, id: randomUUID() });
}
export const listEntitlementsByUser = (user_id: string) => db.list("entitlements", { user_id });
export const listEntitlementsByOrder = (order_id: string) => db.list("entitlements", { order_id });
export const updateEntitlement = (id: string, patch: Partial<Entitlement>) => db.update("entitlements", id, patch);

export const getMembership = (user_id: string) => db.get("memberships", { user_id });
export const listMemberships = () => db.list("memberships");

export async function upsertMembership(user_id: string, patch: Partial<Membership>): Promise<Membership> {
  const found = await getMembership(user_id);
  if (found) return db.update("memberships", found.id, patch);
  return db.insert("memberships", {
    id: randomUUID(), user_id, plan: "MIRACLE_MONTHLY", status: "ACTIVE", rebill_id: null,
    started_at: now(), next_payment_at: null, expired_at: null, ...patch,
  });
}

/* ───────────────────────── 다운로드 기록 ───────────────────────── */

export async function logDownload(d: { user_id: string; product_id: string | null; file_id: string; ip: string | null }) {
  await db.insert("downloads", { id: randomUUID(), downloaded_at: now(), ...d });
}
