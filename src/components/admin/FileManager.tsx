"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { registerFile, requestFileUpload } from "@/app/admin/(panel)/actions";

const TYPES = ["ZIP", "PDF", "MD", "TXT", "TEMPLATE", "DOCX", "XLSX", "ETC"];

function guessType(name: string) {
  const ext = name.split(".").pop()?.toUpperCase() ?? "";
  return TYPES.includes(ext) ? ext : "ETC";
}

export function FileUploader({ productId }: { productId: string }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState("ZIP");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function upload() {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const { uploadUrl, storagePath } = await requestFileUpload(productId, file.name);
      const res = await fetch(uploadUrl, { method: "PUT", body: file, headers: { "content-type": file.type || "application/octet-stream" } });
      if (!res.ok) throw new Error(`업로드 실패 (${res.status})`);
      await registerFile({ productId, fileName: file.name, fileType: type, storagePath, size: file.size });
      setFile(null);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-dashed border-line bg-ivory p-4 md:flex-row md:items-center">
      <input type="file" onChange={(e) => { const f = e.target.files?.[0] ?? null; setFile(f); if (f) setType(guessType(f.name)); }} className="min-w-0 flex-1 text-[13px]" />
      <select value={type} onChange={(e) => setType(e.target.value)} className="input !w-auto !py-2">
        {TYPES.map((t) => <option key={t}>{t}</option>)}
      </select>
      <button type="button" disabled={!file || busy} onClick={upload} className="btn-primary btn-sm">{busy ? "업로드 중..." : "파일 업로드"}</button>
      {error && <p className="text-[13px] text-red-700">{error}</p>}
    </div>
  );
}
