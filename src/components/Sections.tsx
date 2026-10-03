import Link from "next/link";
import { expert } from "@/content/expert";
import type { FaqItem } from "@/lib/types";
import { won } from "@/lib/format";

const SINGLE_PRICE = 200_000;
const MEMBERSHIP_PRICE = 50_000;

/** 타일 배경: 색 전환 자체가 섹션 구분선 */
export type Tone = "light" | "parchment" | "dark";
const TONE: Record<Tone, string> = {
  light: "bg-canvas text-ink",
  parchment: "bg-parchment text-ink",
  dark: "bg-tile text-white",
};

export function Tile({ tone = "light", id, className = "", children }: { tone?: Tone; id?: string; className?: string; children: React.ReactNode }) {
  return (
    <section id={id} className={`section scroll-mt-14 ${TONE[tone]} ${className}`}>
      {children}
    </section>
  );
}

export function SectionHead({
  eyebrow, title, desc, center = true, dark = false,
}: { eyebrow?: string; title: React.ReactNode; desc?: React.ReactNode; center?: boolean; dark?: boolean }) {
  return (
    <div className={center ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      {eyebrow && <div className={`eyebrow ${dark ? "!text-muted-dark" : ""}`}>{eyebrow}</div>}
      <h2 className={`h2 mt-2 text-balance ${dark ? "text-white" : "text-ink"}`}>{title}</h2>
      {desc && <p className={`lead mt-4 ${dark ? "!text-muted-dark" : ""}`}>{desc}</p>}
    </div>
  );
}

const Check = ({ dark = false }: { dark?: boolean }) => (
  <svg width="17" height="17" viewBox="0 0 20 20" className="mt-[3px] shrink-0" fill="none" aria-hidden>
    <path d="M5 10.5l3 3L15 6.5" stroke={dark ? "#2997ff" : "#0066cc"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ───────── 가격 비교 (핵심 전환 영역) ───────── */
export function PricingCompare({
  singleHref = "/prompts", singleLabel = "단품 구매하기", singlePrice = SINGLE_PRICE, productTitle, tone = "parchment",
}: { singleHref?: string; singleLabel?: string; singlePrice?: number; productTitle?: string; tone?: Tone }) {
  return (
    <Tile tone={tone} id="pricing">
      <div className="container-x">
        <SectionHead
          eyebrow="가격"
          title={<>하나의 프롬프트는 {won(singlePrice)}.<br />미라클 멤버십은 월 {won(MEMBERSHIP_PRICE)}.</>}
          desc="미라클 멤버십은 멤버십에 포함된 모든 프롬프트와 자료를 이용할 수 있습니다."
        />
        <div className="mx-auto mt-12 grid max-w-4xl items-stretch gap-5 md:grid-cols-2">
          <div className="card flex flex-col !p-8">
            <div className="text-[14px] font-semibold text-sub">단품 구매</div>
            {productTitle && <div className="mt-1 text-[17px] font-semibold text-ink">{productTitle}</div>}
            <div className="mt-6 text-[40px] font-semibold leading-none tracking-[-0.02em] text-ink">{won(singlePrice)}</div>
            <div className="mt-2 text-[14px] text-sub">1회 결제 · 평생 이용</div>
            <ul className="mt-8 flex-1 space-y-3 text-[17px]">
              {["선택한 프롬프트 1개", "해당 상품 부가자료", "원클릭 프롬프트 복사", "자료 다운로드", "해당 상품 업데이트"].map((t) => (
                <li key={t} className="flex gap-3"><Check />{t}</li>
              ))}
            </ul>
            <Link href={singleHref} className="btn-outline mt-10 w-full">{singleLabel}</Link>
          </div>

          <div className="flex flex-col rounded-[18px] bg-tile p-8 text-white">
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-semibold text-muted-dark">MIRACLE MEMBERSHIP</span>
              <span className="badge bg-accent text-white">추천</span>
            </div>
            <div className="mt-1 text-[17px] font-semibold">미라클 멤버십</div>
            <div className="mt-6 flex items-baseline gap-1.5">
              <span className="text-[17px] text-muted-dark">월</span>
              <span className="text-[40px] font-semibold leading-none tracking-[-0.02em]">{won(MEMBERSHIP_PRICE)}</span>
            </div>
            <div className="mt-2 text-[14px] text-muted-dark">단품 1개 가격의 1/4 · 언제든 해지</div>
            <ul className="mt-8 flex-1 space-y-3 text-[17px]">
              {["전체 프롬프트", "전체 자료 (ZIP · PDF · MD · TXT)", "템플릿 · 실전 예제", "신규 등록 콘텐츠", "업데이트 콘텐츠"].map((t) => (
                <li key={t} className="flex gap-3"><Check dark />{t}</li>
              ))}
            </ul>
            <Link href="/checkout?plan=membership" className="btn-primary mt-10 w-full">미라클 멤버십 시작하기</Link>
          </div>
        </div>
      </div>
    </Tile>
  );
}

/* ───────── 문제 제기 ───────── */
export function ProblemSection({ items, tone = "parchment" }: { items?: string[]; tone?: Tone }) {
  const list = items?.length ? items : [
    "질문을 어떻게 해야 할지 모른다.",
    "매번 새로운 프롬프트를 만든다.",
    "전략이 아닌 평범한 답변만 나온다.",
    "결과를 얻기까지 여러 번 수정해야 한다.",
    "AI 결과를 실제 마케팅으로 연결하기 어렵다.",
  ];
  return (
    <Tile tone={tone}>
      <div className="container-x">
        <SectionHead title={<>AI를 쓰고 있지만<br />결과가 평범한 이유.</>} desc="도구가 아니라 질문의 구조가 결과를 결정합니다." />
        <ul className="mx-auto mt-12 grid max-w-4xl gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((t) => (
            <li key={t} className="card text-[17px] font-semibold leading-[1.35] text-ink">{t}</li>
          ))}
        </ul>
      </div>
    </Tile>
  );
}

/* ───────── 차별성 ───────── */
export function DifferenceSection({ tone = "dark" }: { tone?: Tone }) {
  const flow = ["상황 분석", "고객 분석", "전략 수립", "실행", "검토", "개선"];
  return (
    <Tile tone={tone}>
      <div className="container-x text-center">
        <SectionHead dark title="단순한 질문을 판매하지 않습니다." desc={<>프롬프트를 구매하는 것이 아니라<br />전문가의 사고 구조를 가져가는 것입니다.</>} />
        <div className="mx-auto mt-14 grid max-w-4xl items-center gap-10 md:grid-cols-[0.8fr_1.6fr]">
          <div>
            <div className="text-[14px] font-semibold text-muted-dark">일반 프롬프트</div>
            <div className="mt-4 text-[28px] font-semibold tracking-[-0.01em] text-white/60">질문 → 답변</div>
          </div>
          <div>
            <div className="text-[14px] font-semibold text-muted-dark">MIRACLE PROMPT</div>
            <ol className="mt-4 flex flex-wrap justify-center gap-x-3 gap-y-2 text-[21px] font-semibold tracking-[-0.01em] md:text-[28px]">
              {flow.map((t, i) => (
                <li key={t} className="flex items-center gap-3">
                  {t}{i < flow.length - 1 && <span className="text-accent-dark" aria-hidden>→</span>}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </Tile>
  );
}

/* ───────── 전문가 소개 ───────── */
export function ExpertSection({ tone = "light" }: { tone?: Tone }) {
  return (
    <Tile tone={tone}>
      <div className="container-x grid items-center gap-12 md:grid-cols-[0.85fr_1.15fr] md:gap-16">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={expert.photo} alt={`${expert.name} ${expert.title}`} className="aspect-[4/5] w-full rounded-[18px] object-cover product-shadow" />
        <div>
          <div className="eyebrow">{expert.org}</div>
          <h2 className="h2 mt-2 text-ink">{expert.name} {expert.title}</h2>
          <p className="mt-4 whitespace-pre-line text-[21px] font-semibold leading-[1.3] tracking-[-0.01em] text-ink">{expert.headline}</p>
          <p className="mt-4 text-[17px] text-ink-80">{expert.intro}</p>
          <div className="mt-8 grid grid-cols-3 gap-4 border-y border-hairline py-6">
            {expert.stats.map((s) => (
              <div key={s.label}>
                <div className="text-[24px] font-semibold tracking-[-0.02em] text-ink md:text-[34px]">{s.value}</div>
                <div className="mt-1 text-[14px] text-sub">{s.label}</div>
              </div>
            ))}
          </div>
          <dl className="mt-6 grid gap-5 sm:grid-cols-2">
            {expert.highlights.map((h) => (
              <div key={h.label}>
                <dt className="text-[14px] font-semibold text-ink">{h.label}</dt>
                <dd className="mt-1 space-y-0.5 text-[14px] leading-[1.6] text-ink-80">{h.items.map((i) => <div key={i}>{i}</div>)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </Tile>
  );
}

/* ───────── BEFORE / AFTER ───────── */
export function BeforeAfter({ tone = "parchment" }: { tone?: Tone }) {
  const steps = ["시장 분석", "고객 세분화", "핵심 문제", "포지셔닝", "콘텐츠 전략", "채널 전략", "실행안", "검토"];
  return (
    <Tile tone={tone}>
      <div className="container-x">
        <SectionHead eyebrow="실제 결과" title="같은 AI, 다른 결과." desc="프롬프트 원문보다 중요한 것은 이 프롬프트로 무엇이 만들어지는가입니다." />
        <div className="mx-auto mt-12 grid max-w-4xl gap-5 md:grid-cols-2">
          <div className="card !p-8">
            <div className="text-[14px] font-semibold text-sub">BEFORE · 일반 AI 질문</div>
            <p className="mt-4 text-[21px] font-semibold leading-[1.3] text-ink">“우리 제품 마케팅 전략을 만들어줘.”</p>
            <ul className="mt-6 space-y-1.5 text-[17px] text-sub">
              <li>SNS 마케팅을 활용하세요</li>
              <li>타깃 고객을 명확히 하세요</li>
              <li>차별화된 콘텐츠를 만드세요</li>
            </ul>
            <div className="mt-8 border-t border-hairline pt-4 text-[17px] font-semibold text-sub">누구에게나 해당되는 일반적인 아이디어</div>
          </div>
          <div className="rounded-[18px] bg-tile p-8 text-white">
            <div className="text-[14px] font-semibold text-muted-dark">AFTER · MIRACLE PROMPT</div>
            <p className="mt-4 text-[17px] leading-[1.6] text-muted-dark">{steps.join(" → ")}</p>
            <ul className="mt-6 space-y-1.5 text-[17px]">
              <li>1순위 타깃 고객과 선정 근거</li>
              <li>한 문장 포지셔닝 · 핵심 메시지 3개</li>
              <li>4주 콘텐츠 캘린더 · 채널별 KPI</li>
              <li>30 · 60 · 90일 실행 계획</li>
            </ul>
            <div className="mt-8 border-t border-white/15 pt-4 text-[17px] font-semibold">바로 실행 가능한 마케팅 전략</div>
          </div>
        </div>
      </div>
    </Tile>
  );
}

/* ───────── 프롬프트 미리보기 (후반부 Blur) ───────── */
export function PromptPreview({ content, title = "MARKETING MASTER PROMPT", shadow = false }: { content: string; title?: string; shadow?: boolean }) {
  const lines = content.split("\n");
  const cut = Math.max(6, Math.ceil(lines.length * 0.55));
  return (
    <div className={`prompt-box relative overflow-hidden text-left ${shadow ? "product-shadow" : ""}`}>
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-3.5 font-sans">
        <span className="text-[12px] font-semibold tracking-[0.04em] text-muted-dark">{title}</span>
        <span className="flex gap-1.5" aria-hidden><i className="size-2.5 rounded-full bg-white/20" /><i className="size-2.5 rounded-full bg-white/20" /><i className="size-2.5 rounded-full bg-white/20" /></span>
      </div>
      <pre className="whitespace-pre-wrap px-6 pt-5 font-mono">{lines.slice(0, cut).join("\n")}</pre>
      <div className="relative select-none" aria-hidden>
        <pre className="blur-[5px] whitespace-pre-wrap px-6 pb-6 font-mono opacity-70 blur-fade">{lines.slice(cut).join("\n") || "STEP 05\n...\nSTEP 06\n...\nSTEP 07\n..."}</pre>
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-2 bg-gradient-to-t from-tile via-tile/95 to-transparent px-6 pb-7 pt-16 text-center font-sans">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f5f5f7" strokeWidth="1.8"><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 118 0v4" /></svg>
          <div className="text-[14px] font-semibold text-white">전체 프롬프트는 구매 후 확인할 수 있습니다.</div>
        </div>
      </div>
    </div>
  );
}

/* ───────── 상품 구성 ───────── */
export function Deliverables({ tone = "light" }: { tone?: Tone }) {
  const items = [
    ["MASTER PROMPT", "전략 프로세스 전체가 담긴 시스템 프롬프트"],
    ["사용 설명서", "AI별 사용법과 활용 팁"],
    ["입력 예제", "바로 채워 넣는 입력 템플릿과 작성 예시"],
    ["결과 예제", "실제 출력 결과 샘플"],
    ["실전 자료", "현장에서 쓰는 체크리스트 · 워크시트"],
    ["ZIP · PDF · MD", "모든 자료를 파일로 다운로드"],
  ];
  return (
    <Tile tone={tone}>
      <div className="container-x">
        <SectionHead eyebrow="상품 구성" title="구매하면 이렇게 받습니다." />
        <div className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(([t, d]) => (
            <div key={t} className={tone === "light" ? "rounded-[18px] bg-parchment p-6" : "card"}>
              <div className="text-[17px] font-semibold text-ink">{t}</div>
              <div className="mt-1 text-[14px] leading-[1.45] text-sub">{d}</div>
            </div>
          ))}
        </div>
      </div>
    </Tile>
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

export function Faq({ items = DEFAULT_FAQ, tone = "light" }: { items?: FaqItem[]; tone?: Tone }) {
  return (
    <Tile tone={tone}>
      <div className="container-x max-w-[820px]">
        <SectionHead title="자주 묻는 질문." />
        <div className="mt-10 border-t border-hairline">
          {items.map((f) => (
            <details key={f.q} className="group border-b border-hairline py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-[17px] font-semibold text-ink">
                {f.q}
                <span className="text-[22px] leading-none text-accent transition group-open:rotate-45" aria-hidden>+</span>
              </summary>
              <p className="mt-3 whitespace-pre-line text-[17px] text-ink-80">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </Tile>
  );
}

/* ───────── 라이선스 ───────── */
export function LicenseNotice({ compact = false, dark = false }: { compact?: boolean; dark?: boolean }) {
  return (
    <div className={`rounded-[18px] ${dark ? "bg-white/5 text-white" : "border border-hairline bg-canvas"} ${compact ? "p-5 text-[14px]" : "p-6 text-[14px]"}`}>
      <div className={`font-semibold ${dark ? "text-white" : "text-ink"}`}>라이선스</div>
      <div className="mt-2 grid gap-3 sm:grid-cols-2">
        <p className={dark ? "text-muted-dark" : "text-ink-80"}><b className="font-semibold">허용</b> · 구매자가 자신의 업무, 마케팅, 사업에 사용하는 것</p>
        <p className={dark ? "text-muted-dark" : "text-ink-80"}><b className="font-semibold">금지</b> · 원문·파일 재판매, 제3자 공유, 온라인 공개, 구매 콘텐츠의 상품화, 공유 계정 운영</p>
      </div>
    </div>
  );
}

/* ───────── 최종 CTA ───────── */
export function FinalCta({ tone = "dark" }: { tone?: Tone }) {
  return (
    <Tile tone={tone}>
      <div className="container-x text-center">
        <h2 className={`h2 text-balance ${tone === "dark" ? "text-white" : "text-ink"}`}>민진홍의 마케팅 사고를<br />지금 바로 사용해 보세요.</h2>
        <p className={`lead mt-4 ${tone === "dark" ? "!text-muted-dark" : ""}`}>프롬프트 하나 200,000원 · 멤버십 월 50,000원</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/checkout?plan=membership" className="btn-primary">미라클 멤버십 시작하기</Link>
          <Link href="/prompts" className={tone === "dark" ? "btn border border-accent-dark text-accent-dark" : "btn-outline"}>프롬프트 살펴보기</Link>
        </div>
      </div>
    </Tile>
  );
}
