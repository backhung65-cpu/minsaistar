/** GPT: 맞춤 GPT 솔루션 (멤버십 전용, 단품 판매 없음) */
export type ProductType = "PROMPT" | "FILE" | "PROMPT_FILE" | "PACKAGE" | "GPT";
export type ProductStatus = "DRAFT" | "PUBLISHED" | "HIDDEN" | "ARCHIVED";
export type Badge = "NEW" | "BEST" | "UPDATED" | "PACKAGE" | "MEMBERSHIP" | "FREE";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "CANCELLED" | "REFUNDED";
export type OrderType = "SINGLE" | "MEMBERSHIP";

export interface Category {
  id: string;
  slug: string;
  name: string;
  sort_order: number;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface ChangelogEntry {
  version: string;
  date: string;
  notes: string[];
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  category_id: string | null;
  short_description: string;
  description: string;
  thumbnail: string | null;
  regular_price: number;
  sale_price: number;
  product_type: ProductType;
  prompt_content: string;
  input_template: string;
  usage_example: string;
  result_example: string;
  preview_content: string;
  usage_guide: string;
  /** GPT 실행 주소 — 이용 권한이 있는 회원 화면에만 노출 */
  gpt_url: string | null;
  /** 설명·영상 주소 (네이버 카페 등) — 회원 화면에만 노출 */
  guide_url: string | null;
  /** 만들 수 있는 결과물 */
  output: string;
  problems: string[];
  use_cases: string[];
  faq: FaqItem[];
  changelog: ChangelogEntry[];
  badges: Badge[];
  package_product_ids: string[];
  membership_included: boolean;
  status: ProductStatus;
  version: string;
  seo_title: string | null;
  seo_description: string | null;
  og_image: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProductFile {
  id: string;
  product_id: string;
  file_name: string;
  file_type: string;
  storage_path: string;
  size_bytes: number;
  created_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  product_id: string | null;
  order_type: OrderType;
  amount: number;
  payment_provider: string;
  payment_id: string | null;
  rebill_id: string | null;
  payment_status: PaymentStatus;
  raw_payload: Record<string, unknown> | null;
  created_at: string;
  paid_at: string | null;
}

export interface Entitlement {
  id: string;
  user_id: string;
  product_id: string | null;
  order_id: string | null;
  type: OrderType;
  status: "ACTIVE" | "REVOKED" | "EXPIRED";
  starts_at: string;
  expires_at: string | null;
}

export interface Membership {
  id: string;
  user_id: string;
  plan: string;
  status: "ACTIVE" | "CANCELLED" | "EXPIRED";
  rebill_id: string | null;
  started_at: string;
  next_payment_at: string | null;
  expired_at: string | null;
}

export interface Download {
  id: string;
  user_id: string;
  product_id: string | null;
  file_id: string | null;
  downloaded_at: string;
  ip: string | null;
}

export interface AccessCode {
  id: string;
  email: string;
  code_hash: string;
  attempts: number;
  expires_at: string;
  used_at: string | null;
  created_at: string;
}

export interface Tables {
  categories: Category;
  products: Product;
  product_files: ProductFile;
  users: User;
  orders: Order;
  entitlements: Entitlement;
  memberships: Membership;
  downloads: Download;
  access_codes: AccessCode;
}
export type TableName = keyof Tables;
