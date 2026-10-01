import Link from "next/link";
import { expert } from "@/content/expert";
import type { FaqItem } from "@/lib/types";
import { won } from "@/lib/format";

const SINGLE_PRICE = 200_000;
const MEMBERSHIP_PRICE = 50_000;

export function SectionHead({ eyebrow, title, desc, center = false }: { eyebrow: string; title: React.ReactNode; desc?: React.ReactNode; center?: boolean }) {
  return (
    <div className={center ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <div className="eyebrow">{eyebrow}</div>
      <h2 className="h2 mt-4 text-navy">{title}</h2>
      {desc && <p className="lead mt-5">{desc}</p>}
    </div>
  );
}

const Check = ({ gold = false }: { gold?: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 20 20" className="mt-0.5 shrink-0" fill="none">
    <circle cx="10" cy="10" r="10" fill={gold ? "#C49A55" : "#152238"} opacity={gold ? 1 : 0.08} />
    <path d="M6 10.5l2.5 2.5L14 7.5" stroke={gold ? "#152238" : "#152238"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ───────── 가격 비교 (핵심 전환 영역) ───────── */
export function PricingCompare({
  singleHref = "/prompts", singleLabel = "단품 구매하기", singlePrice = SINGLE_PRICE, productTitle,
}: { singleHref?: string; singleLabel?: string; singlePrice?: number; productTitle?: string }) {
  return (
    <section id="pricing" className="section bg-ivory-2/60" data-sticky="membership">
      <div className="container-x">
        <SectionHead
          center
          eyebrow="PRICING"
          title={<>하나의 프롬프트는 {won(singlePrice)}.<br className="hidden md:block" /> 미라클 멤버십은 월 {won(MEMBERSHIP_PRICE)}.</>}
          desc="미라클 멤버십은 멤버십에 포함된 모든 프롬프트와 자료를 이용할 수 있습니다."
        />
        <div className="mx-auto mt-14 grid max-w-5xl items-stretch gap-6 md:grid-cols-2">
          <div className="card flex flex-col">
            <div className="text-[13px] font-bold tracking-[0.18em] text-sub">SINGLE</div>
            <div className="mt-2 text-[22px] font-bold text-navy">단품 구매</div>
            {productTitle && <div className="mt-1 text-[14px] text-sub">{productTitle}</div>}
            <div className="mt-6 text-[40px] font-extrabold tracking-tight text-navy">{won(singlePrice)}</div>
            <div className="text-[13px] text-sub">1회 결제 · 평생 이용</div>
            <ul className="mt-8 flex-1 space-y-3.5 text-[15px]">
              {["선택한 프롬프트 1개", "해당 상품 부가자료", "원클릭 프롬프트 복사", "자료 다운로드", "해당 상품 업데이트"].map((t) => (
                <li key={t} className="flex gap-3"><Check />{t}</li>
              ))}
            </ul>
            <Link href={singleHref} className="btn-outline mt-10 w-full py-4">{singleLabel}</Link>
          </div>

          <div className="relative flex flex-col rounded-[22px] bg-navy p-6 text-white shadow-[0_24px_60px_-24px_rgba(21,34,56,0.55)] ring-2 ring-gold md:-my-4 md:p-10">
            <span className="badge absolute -top-3 left-8 bg-gold text-navy">RECOMMENDED</span>
            <div className="text-[13px] font-bold tracking-[0.18em] text-gold">MIRACLE MEMBERSHIP</div>
            <div className="mt-2 text-[22px] font-bold">미라클 멤버십</div>
            <div className="mt-6 flex items-end gap-2">
              <span className="text-[15px] font-semibold text-white/70">월</span>
              <span className="text-[44px] leading-none font-extrabold tracking-tight">{won(MEMBERSHIP_PRICE)}</span>
            </div>
            <div className="mt-2 text-[13px] text-white/60">단품 1개 가격의 1/4 · 언제든 해지</div>
            <ul className="mt-8 flex-1 space-y-3.5 text-[15px]">
              {["전체 프롬프트", "전체 자료 (ZIP · PDF · MD · TXT)", "템플릿 · 실전 예제", "신규 등록 콘텐츠", "업데이트 콘텐츠"].map((t) => (
                <li key={t} className="flex gap-3"><Check gold />{t}</li>
              ))}
            </ul>
            <Link href="/checkout?plan=membership" className="btn-gold mt-10 w-full py-4 text-[16px]">미라클 멤버십 시작하기</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────── 문제 제기 ───────── */
export function ProblemSection({ items }: { items?: string[] }) {
  const list = items?.length ? items : [
    "질문을 어떻게 해야 할지 모른다.",
    "매번 새로운 프롬프트를 만든다.",
    "전략이 아닌 평범한 답변만 나온다.",
    "결과를 얻기까지 여러 번 수정해야 한다.",
    "AI 결과를 실제 마케팅으로 연결하기 어렵다.",
  ];
  return (
    <section className="section">
      <div className="container-x grid gap-12 md:grid-cols-[1fr_1.2fr] md:gap-20">
        <SectionHead eyebrow="PROBLEM" title={<>AI를 사용하고 있지만<br />결과가 평범한 이유</>} desc="도구가 아니라 질문의 구조가 결과를 결정합니다." />
        <ul className="divide-y divide-line border-y border-line">
          {list.map((t, i) => (
            <li key={t} className="flex items-baseline gap-6 py-5 md:py-6">
              <span className="font-mono text-[13px] text-gold">{String(i + 1).padStart(2, "0")}</span>
              <span className="text-[17px] md:text-[19px] font-semibold text-navy">{t}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ───────── 차별성 ───────── */
export function DifferenceSection() {
  const flow = ["상황 분석", "고객 분석", "전략 수립", "실행", "검토", "개선"];
  return (
    <section className="section bg-white">
      <div className="container-x">
        <SectionHead center eyebrow="DIFFERENCE" title="단순한 질문을 판매하지 않습니다." />
        <div className="mx-auto mt-14 grid max-w-5xl gap-6 md:grid-cols-[1fr_1.6fr]">
          <div className="rounded-[22px] border border-line bg-ivory p-8">
            <div className="text-[13px] font-bold tracking-[0.18em] text-sub">일반 프롬프트</div>
            <div className="mt-8 flex flex-col items-center gap-3 text-[16px] font-semibold text-sub">
              <span className="rounded-full border border-line bg-white px-6 py-2.5">질문</span>
              <span>↓</span>
              <span className="rounded-full border border-line bg-white px-6 py-2.5">답변</span>
            </div>
          </div>
          <div className="rounded-[22px] bg-navy p-8 text-white">
            <div className="text-[13px] font-bold tracking-[0.18em] text-gold">MIRACLE PROMPT</div>
            <ol className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3">
              {flow.map((t, i) => (
                <li key={t} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                  <div className="font-mono text-[12px] text-gold">STEP {String(i + 1).padStart(2, "0")}</div>
                  <div className="mt-1 text-[16px] font-bold">{t}</div>
                </li>
              ))}
            </ol>
          </div>
        </div>
        <p className="mx-auto mt-14 max-w-3xl text-center text-[22px] md:text-[28px] font-bold leading-snug text-navy">
          프롬프트를 구매하는 것이 아니라<br /><span className="text-gold-2">전문가의 사고 구조</span>를 가져가는 것입니다.
        </p>
      </div>
    </section>
  );
}

/* ───────── 전문가 소개 ───────── */
export function ExpertSection() {
  return (
    <section className="section">
      <div className="container-x grid items-center gap-12 md:grid-cols-[0.9fr_1.1fr] md:gap-20">
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={expert.photo} alt={`${expert.name} ${expert.title}`} className="aspect-[4/5] w-full rounded-[22px] object-cover" />
          <div className="absolute -bottom-6 left-6 right-6 rounded-2xl bg-white p-5 shadow-[0_12px_40px_-16px_rgba(21,34,56,0.3)] md:left-auto md:right-[-24px] md:w-64">
            <div className="text-[12px] tracking-[0.18em] text-sub">{expert.org}</div>
            <div className="mt-1 text-[22px] font-extrabold text-navy">{expert.name} <span className="text-[15px] font-semibold text-sub">{expert.title}</span></div>
          </div>
        </div>
        <div className="mt-6 md:mt-0">
          <div className="eyebrow">EXPERT</div>
          <h2 className="h2 mt-4 whitespace-pre-line text-navy">{expert.headline}</h2>
          <p className="lead mt-6">{expert.intro}</p>
          <div className="mt-10 grid grid-cols-3 gap-4 border-y border-line py-6">
            {expert.stats.map((s) => (
              <div key={s.label}>
                <div className="text-[24px] md:text-[30px] font-extrabold text-navy">{s.value}</div>
                <div className="mt-1 text-[12.5px] text-sub">{s.label}</div>
              </div>
            ))}
          </div>
          <dl className="mt-8 grid gap-6 sm:grid-cols-2">
            {expert.highlights.map((h) => (
              <div key={h.label}>
                <dt className="text-[13px] font-bold tracking-[0.12em] text-gold-2">{h.label}</dt>
                <dd className="mt-2 space-y-1 text-[15px] text-ink">{h.items.map((i) => <div key={i}>{i}</div>)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

/* ───────── BEFORE / AFTER ───────── */
export function BeforeAfter() {
  const steps = ["시장 분석", "고객 세분화", "핵심 문제", "포지셔닝", "콘텐츠 전략", "채널 전략", "실행안", "검토"];
  return (
    <section className="section bg-white">
      <div className="container-x">
        <SectionHead center eyebrow="RESULT" title="같은 AI, 다른 결과" desc="프롬프트 원문보다 중요한 것은 이 프롬프트로 무엇이 만들어지는가입니다." />
        <div className="mx-auto mt-14 grid max-w-5xl gap-6 md:grid-cols-2">
          <div className="rounded-[22px] border border-line bg-ivory p-8">
            <span className="badge bg-ivory-2 text-sub">BEFORE</span>
            <div className="mt-5 text-[14px] text-sub">일반 AI 질문</div>
            <div className="mt-2 rounded-xl border border-line bg-white p-4 font-mono text-[14px]">&ldquo;우리 제품 마케팅 전략을 만들어줘.&rdquo;</div>
            <div className="my-6 text-center text-sub">↓</div>
            <ul className="space-y-2 text-[15px] text-sub">
              <li>· SNS 마케팅을 활용하세요</li>
              <li>· 타깃 고객을 명확히 하세요</li>
              <li>· 차별화된 콘텐츠를 만드세요</li>
            </ul>
            <div className="mt-8 text-[17px] font-bold text-sub">→ 누구에게나 해당되는 일반적인 아이디어</div>
          </div>
          <div className="rounded-[22px] bg-navy p-8 text-white ring-1 ring-gold/50">
            <span className="badge bg-gold text-navy">AFTER</span>
            <div className="mt-5 text-[14px] text-white/60">MIRACLE PROMPT</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {steps.map((s, i) => (
                <span key={s} className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[13px]">
                  <span className="font-mono text-gold">{i + 1}</span> {s}
                </span>
              ))}
            </div>
            <div className="my-6 text-center text-gold">↓</div>
            <ul className="space-y-2 text-[15px] text-white/85">
              <li>· 1순위 타깃 고객과 선정 근거</li>
              <li>· 한 문장 포지셔닝 · 핵심 메시지 3개</li>
              <li>· 4주 콘텐츠 캘린더 · 채널별 KPI</li>
              <li>· 30 · 60 · 90일 실행 계획</li>
            </ul>
            <div className="mt-8 text-[17px] font-bold text-gold">→ 바로 실행 가능한 마케팅 전략</div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────── 프롬프트 미리보기 (후반부 Blur) ───────── */
export function PromptPreview({ content, title = "MARKETING MASTER PROMPT" }: { content: string; title?: string }) {
  const lines = content.split("\n");
  const cut = Math.max(6, Math.ceil(lines.length * 0.55));
  return (
    <div className="prompt-box relative overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <span className="text-[12px] font-bold tracking-[0.22em] text-gold">{title}</span>
        <span className="flex gap-1.5"><i className="size-2.5 rounded-full bg-white/15" /><i className="size-2.5 rounded-full bg-white/15" /><i className="size-2.5 rounded-full bg-white/15" /></span>
      </div>
      <pre className="whitespace-pre-wrap px-6 pt-5 font-mono">{lines.slice(0, cut).join("\n")}</pre>
      <div className="relative select-none" aria-hidden>
        <pre className="blur-[5px] whitespace-pre-wrap px-6 pb-6 font-mono opacity-70 blur-fade">{lines.slice(cut).join("\n") || "STEP 05\n...\nSTEP 06\n...\nSTEP 07\n..."}</pre>
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-2 bg-gradient-to-t from-navy via-navy/95 to-transparent px-6 pb-7 pt-16 text-center">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C49A55" strokeWidth="2"><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 118 0v4" /></svg>
          <div className="font-sans text-[15px] font-semibold text-white">전체 프롬프트는 구매 후 확인할 수 있습니다.</div>
        </div>
      </div>
    </div>
  );
}

/* ───────── 상품 구성 ───────── */
export function Deliverables() {
  const items = [
    ["MASTER PROMPT", "전략 프로세스 전체가 담긴 시스템 프롬프트"],
    ["사용 설명서", "AI별 사용법과 활용 팁"],
    ["입력 예제", "바로 채워 넣는 입력 템플릿과 작성 예시"],
    ["결과 예제", "실제 출력 결과 샘플"],
    ["실전 자료", "현장에서 쓰는 체크리스트 · 워크시트"],
    ["ZIP / PDF / MD", "모든 자료를 파일로 다운로드"],
  ];
  return (
    <section className="section">
      <div className="container-x">
        <SectionHead eyebrow="WHAT YOU GET" title="구매하면 이렇게 받습니다." />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(([t, d], i) => (
            <div key={t} className="card">
              <div className="font-mono text-[13px] text-gold">{String(i + 1).padStart(2, "0")}</div>
              <div className="mt-4 text-[19px] font-bold text-navy">{t}</div>
              <div className="mt-2 text-[14.5px] text-sub">{d}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────── FAQ ───────── */
export const DEFAULT_FAQ: FaqItem[] = [
  { q: "결제 후 바로 사용할 수 있나요?", a: "네. 결제가 서버에서 확인되면 즉시 프롬프트를 열람·복사하고 자료를 다운로드할 수 있습니다." },
  { q: "회원가입이 필요한가요?", a: "아니요. 이름·휴대전화·이메일만 입력하면 구매할 수 있으며, 다른 기기에서는 이메일 인증으로 구매 자료를 다시 열 수 있습니다." },
  { q: "멤버십은 언제든 해지할 수 있나요?", a: "네. 해지 후에도 이미 결제한 기간이 끝날 때까지 이용할 수 있습니다." },
  { q: "어떤 AI에서 사용할 수 있나요?", a: "ChatGPT, Claude, Gemini 등 주요 대화형 AI에서 사용할 수 있습니다." },
  { q: "환불이 가능한가요?", a: "디지털 콘텐츠 특성상 프롬프트 열람 또는 자료 다운로드 이후에는 환불이 제한됩니다. 열람 전에는 고객센터로 문의해 주세요." },
];

export function Faq({ items = DEFAULT_FAQ }: { items?: FaqItem[] }) {
  return (
    <section className="section">
      <div className="container-x grid gap-12 md:grid-cols-[1fr_1.6fr]">
        <SectionHead eyebrow="FAQ" title="자주 묻는 질문" />
        <div className="divide-y divide-line border-y border-line">
          {items.map((f) => (
            <details key={f.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-[17px] font-semibold text-navy">
                {f.q}
                <span className="text-gold transition group-open:rotate-45 text-[22px] leading-none">+</span>
              </summary>
              <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-sub">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────── 라이선스 ───────── */
export function LicenseNotice({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`rounded-2xl border border-line bg-white ${compact ? "p-5 text-[13px]" : "p-6 text-[14px]"}`}>
      <div className="font-bold text-navy">라이선스</div>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <div>
          <div className="font-semibold text-emerald-700">허용</div>
          <p className="mt-1 text-sub">구매자가 자신의 업무, 마케팅, 사업에 사용하는 것</p>
        </div>
        <div>
          <div className="font-semibold text-red-700">금지</div>
          <p className="mt-1 text-sub">원문·파일 재판매, 제3자 공유, 온라인 공개, 구매 콘텐츠의 상품화, 공유 계정 운영</p>
        </div>
      </div>
    </div>
  );
}

/* ───────── 최종 CTA ───────── */
export function FinalCta() {
  return (
    <section className="bg-navy py-20 md:py-24 text-white">
      <div className="container-x text-center">
        <div className="eyebrow">MIRACLE PROMPT</div>
        <h2 className="h2 mt-4">민진홍의 마케팅 사고를<br />지금 바로 사용해 보세요.</h2>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/prompts" className="btn border border-white/25 text-white hover:bg-white/10">프롬프트 살펴보기</Link>
          <Link href="/checkout?plan=membership" className="btn-gold">미라클 멤버십 시작하기</Link>
        </div>
      </div>
    </section>
  );
}
