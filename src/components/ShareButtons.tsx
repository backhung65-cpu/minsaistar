"use client";
import { useState } from "react";

export function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const enc = encodeURIComponent(url);
  async function copy() {
    await navigator.clipboard.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }
  async function share() {
    if (navigator.share) await navigator.share({ title, url }).catch(() => {});
    else copy();
  }
  const cls = "inline-flex size-11 items-center justify-center rounded-full bg-chip/60 text-[12px] text-ink active:scale-95";
  return (
    <div className="flex items-center gap-2">
      <button type="button" onClick={copy} className={`${cls} w-auto px-4`}>{copied ? "✓ 복사됨" : "링크 복사"}</button>
      <button type="button" onClick={share} className={cls} aria-label="카카오톡 등으로 공유" title="Kakao · 공유">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#3A1D1D"><path d="M12 3C6.5 3 2 6.6 2 11c0 2.8 1.9 5.3 4.7 6.7l-1 3.6c-.1.3.3.6.6.4l4.2-2.8c.5.1 1 .1 1.5.1 5.5 0 10-3.6 10-8S17.5 3 12 3z"/></svg>
      </button>
      <a className={cls} href={`https://www.facebook.com/sharer/sharer.php?u=${enc}`} target="_blank" rel="noopener noreferrer" aria-label="Facebook 공유">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#1877F2"><path d="M14 8V6c0-.9.6-1 1-1h3V1h-4c-3.3 0-4 2.5-4 4v3H7v4h3v11h4V12h3.4l.6-4z"/></svg>
      </a>
    </div>
  );
}
