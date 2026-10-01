import type { Badge } from "@/lib/types";

const STYLE: Record<Badge, string> = {
  NEW: "bg-gold text-navy",
  BEST: "bg-navy text-white",
  UPDATED: "bg-gold-soft text-gold-2",
  PACKAGE: "bg-ivory-2 text-navy",
  MEMBERSHIP: "bg-navy/10 text-navy",
  FREE: "bg-emerald-50 text-emerald-700",
};

export function Badges({ badges }: { badges: Badge[] }) {
  if (!badges.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {badges.map((b) => <span key={b} className={`badge ${STYLE[b]}`}>{b}</span>)}
    </div>
  );
}
