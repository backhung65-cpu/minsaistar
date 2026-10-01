"use client";
import { useState } from "react";

export function CopyButton({
  text, label, className = "btn-gold", doneLabel = "✓ 복사되었습니다",
}: { text: string; label: string; className?: string; doneLabel?: string }) {
  const [done, setDone] = useState(false);
  async function copy() {
    // 인앱 브라우저 등에서 Clipboard API가 거부·지연되는 경우 execCommand로 대체
    const fallback = () => {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.cssText = "position:fixed;top:0;left:0;opacity:0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    };
    try {
      if (!navigator.clipboard) throw new Error("no clipboard");
      await Promise.race([
        navigator.clipboard.writeText(text),
        new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 1200)),
      ]);
    } catch {
      fallback();
    }
    setDone(true);
    setTimeout(() => setDone(false), 2200);
  }
  return (
    <button type="button" onClick={copy} className={className} aria-live="polite">
      {done ? doneLabel : label}
    </button>
  );
}
