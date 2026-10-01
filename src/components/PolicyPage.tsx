export function PolicyPage({ title, sections }: { title: string; sections: { h: string; body: string[] }[] }) {
  return (
    <section className="container-x max-w-3xl py-14 md:py-20">
      <div className="eyebrow">POLICY</div>
      <h1 className="mt-3 text-[30px] font-extrabold text-navy">{title}</h1>
      <div className="mt-10 space-y-10">
        {sections.map((s) => (
          <div key={s.h}>
            <h2 className="text-[18px] font-bold text-navy">{s.h}</h2>
            <ul className="mt-3 space-y-2 text-[15px] leading-relaxed text-ink">
              {s.body.map((b) => <li key={b}>· {b}</li>)}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-14 text-[13px] text-sub">※ 본 문서는 기본 템플릿입니다. 사업자 정보와 실제 운영 정책에 맞게 수정 후 게시하세요.</p>
    </section>
  );
}
