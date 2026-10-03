import type { Badge } from "@/lib/types";

const LABEL: Record<Badge, string> = {
  NEW: "New", BEST: "Best", UPDATED: "Updated", PACKAGE: "Package", MEMBERSHIP: "Membership", FREE: "Free",
};

/** 배지는 강조색을 쓰지 않고 텍스트로만 구분 (인터랙티브 색은 Action Blue 하나) */
export function Badges({ badges }: { badges: Badge[] }) {
  if (!badges.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {badges.map((b) => (
        <span key={b} className={`badge ${b === "NEW" ? "bg-ink text-white" : "bg-parchment text-ink-80"}`}>{LABEL[b]}</span>
      ))}
    </div>
  );
}
