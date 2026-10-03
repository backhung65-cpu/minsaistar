"use client";
import Link from "next/link";
import { useMemo, useState } from "react";

export interface LibraryItem {
  id: string; slug: string; title: string; short: string; version: string;
  category: string; categoryName: string; hasPrompt: boolean; hasTemplate: boolean;
  fileTypes: string[]; isNew: boolean; isUpdated: boolean; updatedAt: string;
}

const TYPES = [
  { key: "all", label: "전체" },
  { key: "prompt", label: "프롬프트" },
  { key: "ZIP", label: "ZIP" },
  { key: "PDF", label: "PDF" },
  { key: "template", label: "템플릿" },
];

export function LibraryBrowser({ items, categories }: { items: LibraryItem[]; categories: { slug: string; name: string }[] }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [type, setType] = useState("all");

  const list = useMemo(() => {
    const k = q.trim().toLowerCase();
    return items.filter((i) => {
      if (cat && i.category !== cat) return false;
      if (type === "prompt" && !i.hasPrompt) return false;
      if (type === "template" && !i.hasTemplate) return false;
      if ((type === "ZIP" || type === "PDF") && !i.fileTypes.includes(type)) return false;
      return !k || `${i.title} ${i.short} ${i.categoryName}`.toLowerCase().includes(k);
    });
  }, [items, q, cat, type]);

  const filtering = q || cat || type !== "all";
  const fresh = items.filter((i) => i.isNew);
  const updated = items.filter((i) => i.isUpdated);

  return (
    <div className="container-x py-10 md:py-14">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="프롬프트 검색..." className="input pl-11" />
          <svg className="absolute left-4 top-1/2 -translate-y-1/2" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#737373" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
        </div>
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {TYPES.map((t) => (
            <button key={t.key} onClick={() => setType(t.key)} className={`btn-sm btn shrink-0 border ${type === t.key ? "border-ink bg-ink text-white" : "border-line bg-white text-ink"}`}>{t.label}</button>
          ))}
        </div>
      </div>
      <div className="no-scrollbar mt-4 flex gap-1 overflow-x-auto border-b border-line">
        {[{ slug: "", name: "전체" }, ...categories].map((c) => (
          <button key={c.slug || "all"} onClick={() => setCat(c.slug)} className={`shrink-0 border-b-2 px-4 py-3 text-[14.5px] font-semibold ${cat === c.slug ? "border-ink text-ink" : "border-transparent text-sub"}`}>{c.name}</button>
        ))}
      </div>

      {!filtering && fresh.length > 0 && <Shelf label="NEW" title="신규 프롬프트" items={fresh} />}
      {!filtering && updated.length > 0 && <Shelf id="updated" label="UPDATED" title="최근 업데이트" items={updated} />}

      <div className="mt-12">
        <div className="eyebrow">ALL CONTENTS</div>
        <div className="mt-2 flex items-baseline justify-between">
          <h2 className="text-[22px] font-semibold text-ink">전체 콘텐츠</h2>
          <span className="text-[14px] text-sub">{list.length}개</span>
        </div>
        <ul className="mt-5 divide-y divide-line overflow-hidden rounded-[18px] border border-line bg-white">
          {list.map((i) => <Row key={i.id} item={i} />)}
          {list.length === 0 && <li className="p-10 text-center text-sub">검색 결과가 없습니다.</li>}
        </ul>
      </div>
    </div>
  );
}

function Shelf({ id, label, title, items }: { id?: string; label: string; title: string; items: LibraryItem[] }) {
  return (
    <div id={id} className="mt-12 scroll-mt-24">
      <div className="eyebrow">{label}</div>
      <h2 className="mt-2 text-[22px] font-semibold text-ink">{title}</h2>
      <div className="no-scrollbar mt-5 flex gap-4 overflow-x-auto pb-2">
        {items.map((i) => (
          <Link key={i.id} href={`/viewer/${i.slug}`} className="w-[280px] shrink-0 rounded-[18px] border border-line bg-white p-5 hover:border-ink">
            <div className="text-[12px] text-sub">{i.categoryName || "PROMPT"}</div>
            <div className="mt-2 font-semibold text-ink">{i.title}</div>
            <div className="mt-1 line-clamp-2 text-[13.5px] text-sub">{i.short}</div>
            <div className="mt-4 text-[12px] text-sub">v{i.version} · {i.updatedAt}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Row({ item: i }: { item: LibraryItem }) {
  return (
    <li className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:gap-6 md:px-7">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-[12px]">
          <span className="text-sub">{i.categoryName || "PROMPT"}</span>
          {i.isNew && <span className="badge bg-ink text-white">New</span>}
          {i.isUpdated && <span className="badge bg-parchment text-ink-80">Updated</span>}
        </div>
        <div className="mt-1 text-[17px] font-semibold text-ink">{i.title}</div>
        <div className="mt-0.5 truncate text-[14px] text-sub">{i.short}</div>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {i.hasPrompt && <span className="badge bg-ink/5 text-ink">PROMPT</span>}
        {i.fileTypes.map((t) => <span key={t} className="badge bg-parchment text-ink">{t}</span>)}
      </div>
      <Link href={`/viewer/${i.slug}`} className="btn-primary btn-sm shrink-0">열기</Link>
    </li>
  );
}
