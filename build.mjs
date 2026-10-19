/**
 * MIRACLE SKILLS 빌드 스크립트 (외부 패키지 없음, Node 18+)
 *
 *   node build.mjs
 *
 * skills/ 폴더의 이미지와 같은 이름의 .txt 파일을 읽어 갤러리 데이터를 만들고,
 * 배포용 dist/ 폴더를 생성합니다. dist/index.html을 더블클릭해도 그대로 열립니다.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const SKILLS = path.join(ROOT, "skills");
const DIST = path.join(ROOT, "dist");
const IMG = [".png", ".jpg", ".jpeg", ".webp", ".gif"];

const site = JSON.parse(fs.readFileSync(path.join(ROOT, "site.json"), "utf8"));
const warn = [];

/** "키: 값" 머리말 + "---" + 본문 */
function parseTxt(text) {
  const lines = text.replace(/^﻿/, "").replace(/\r/g, "").split("\n");
  const meta = {};
  let i = 0;
  for (; i < lines.length; i++) {
    const line = lines[i];
    if (/^-{3,}\s*$/.test(line)) { i++; break; }
    const m = line.match(/^\s*([^:：]+?)\s*[:：]\s*(.*)$/);
    if (m) meta[m[1].trim()] = m[2].trim();
    else if (line.trim()) { break; }
  }
  return { meta, body: lines.slice(i).join("\n").trim() };
}

const num = (v, d) => {
  const n = Number(String(v ?? "").replace(/[^\d]/g, ""));
  return n > 0 ? n : d;
};

const files = fs.existsSync(SKILLS) ? fs.readdirSync(SKILLS) : [];
const visible = (f) => !f.startsWith(".") && !f.startsWith("_");
const images = files.filter((f) => IMG.includes(path.extname(f).toLowerCase()) && visible(f));
const skills = [];

for (const img of images) {
  const base = path.basename(img, path.extname(img));
  const txtPath = path.join(SKILLS, `${base}.txt`);
  const { meta, body } = fs.existsSync(txtPath) ? parseTxt(fs.readFileSync(txtPath, "utf8")) : { meta: {}, body: "" };
  if (!fs.existsSync(txtPath)) warn.push(`${img}: 같은 이름의 .txt 파일이 없어 제목만 표시됩니다.`);

  const no = Number((base.match(/^(\d+)/) || [])[1] || 0);
  const month = meta["공개월"] || meta["공개"] || "";
  if (month && !/^\d{4}-\d{2}$/.test(month)) warn.push(`${base}: 공개월은 2026-10 형식으로 적어 주세요. (현재: ${month})`);
  if (meta["카페"] || meta["링크"]) warn.push(`${base}: 카페 주소는 사이트에 노출되지 않도록 글 파일에서 지우고, 페이앱 "결제 완료 후 이동 주소"에만 넣어 주세요.`);
  const pay = meta["결제"] || meta["결제링크"] || site.payUrl || "";
  const memberPay = meta["회원결제"] || site.memberPayUrl || "";
  for (const [k, v] of [["결제", pay], ["회원결제", memberPay]]) if (v && !/^https?:\/\//.test(v)) warn.push(`${base}: ${k} 링크는 https:// 로 시작해야 합니다.`);

  skills.push({
    id: base,
    no,
    title: meta["제목"] || base.replace(/^\d+[-_ ]*/, "").replace(/[-_]+/g, " ") || base,
    summary: meta["요약"] || "",
    month,
    always: /^(예|yes|y|true|상시)$/i.test(meta["상시판매"] || ""),
    tags: (meta["태그"] || "").split(/[,·]/).map((t) => t.trim()).filter(Boolean),
    price: num(meta["일반가"], site.price),
    memberPrice: num(meta["회원가"], site.memberPrice),
    pay,
    memberPay,
    image: `skills/${encodeURIComponent(img)}`,
    body,
  });
}
for (const f of files.filter((f) => f.endsWith(".txt") && visible(f))) {
  const base = path.basename(f, ".txt");
  if (!images.some((i) => path.basename(i, path.extname(i)) === base)) warn.push(`${f}: 같은 이름의 이미지가 없어 건너뜁니다.`);
}
skills.sort((a, b) => a.no - b.no || a.id.localeCompare(b.id));

/* dist 생성 */
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(path.join(DIST, "skills"), { recursive: true });
for (const f of ["index.html", "styles.css", "app.js", "robots.txt"]) {
  if (fs.existsSync(path.join(ROOT, f))) fs.copyFileSync(path.join(ROOT, f), path.join(DIST, f));
}
fs.cpSync(path.join(ROOT, "assets"), path.join(DIST, "assets"), { recursive: true });
for (const img of images) fs.copyFileSync(path.join(SKILLS, img), path.join(DIST, "skills", img));

const data = `/* 자동 생성 파일 — 직접 고치지 말고 skills/ 폴더와 site.json을 수정한 뒤 node build.mjs 를 실행하세요. */
window.SITE = ${JSON.stringify(site, null, 2)};
window.SKILLS = ${JSON.stringify(skills, null, 2)};
`;
fs.writeFileSync(path.join(DIST, "skills-data.js"), data);
fs.writeFileSync(path.join(ROOT, "skills-data.js"), data); // 원본 폴더에서 index.html을 바로 열어 볼 때 사용

/* 공유 미리보기용 절대 주소 (site.json의 siteUrl 또는 Vercel 주소) */
const siteUrl = (site.siteUrl || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "")).replace(/\/$/, "");
if (siteUrl) {
  const p = path.join(DIST, "index.html");
  fs.writeFileSync(p, fs.readFileSync(p, "utf8").replace(/content="assets\/og\.png"/g, `content="${siteUrl}/assets/og.png"`).replace(/<meta property="og:url" content="[^"]*"/, `<meta property="og:url" content="${siteUrl}/"`));
}

console.log(`스킬 ${skills.length}개 → dist/`);
for (const s of skills) console.log(`  #${String(s.no).padStart(3, "0")} ${s.title}  (${s.month || "공개월 없음"}${s.always ? ", 상시판매" : ""})`);
if (warn.length) { console.log("\n확인 필요:"); for (const w of warn) console.log("  - " + w); }
