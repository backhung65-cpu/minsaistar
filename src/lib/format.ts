export const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;

export function fmtDate(iso: string | null | undefined, withTime = false): string {
  if (!iso) return "-";
  const d = new Date(iso);
  const parts = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit",
    ...(withTime ? { hour: "2-digit", minute: "2-digit", hour12: false } : {}),
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const date = `${get("year")}.${get("month")}.${get("day")}`;
  return withTime ? `${date} ${get("hour")}:${get("minute")}` : date;
}

export const PRODUCT_TYPE_LABEL = {
  PROMPT: "PROMPT",
  FILE: "FILE",
  PROMPT_FILE: "PROMPT + FILE",
  PACKAGE: "PACKAGE",
  GPT: "GPT 솔루션",
} as const;

export const STATUS_LABEL: Record<string, string> = {
  PENDING: "결제대기", PAID: "결제완료", FAILED: "결제실패", CANCELLED: "결제취소", REFUNDED: "환불",
  DRAFT: "작성중", PUBLISHED: "판매중", HIDDEN: "숨김", ARCHIVED: "보관",
  ACTIVE: "활성", EXPIRED: "만료",
};

export function fileSize(bytes: number) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)}MB`;
}
