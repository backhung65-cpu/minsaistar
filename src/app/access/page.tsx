import type { Metadata } from "next";
import { AccessForm } from "./AccessForm";

export const metadata: Metadata = { title: "구매 자료 다시 열기", robots: { index: false } };

export default async function Access({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <section className="container-x max-w-md py-16 md:py-24">
      <div className="eyebrow">MY CONTENT</div>
      <h1 className="mt-3 text-[28px] font-semibold text-ink">구매 자료 다시 열기</h1>
      <p className="mt-3 text-[15px] text-sub">회원가입 없이, 구매 시 입력한 이메일 인증만으로 구매한 프롬프트와 멤버십 자료에 다시 접근할 수 있습니다.</p>
      <div className="card mt-8"><AccessForm next={next} /></div>
    </section>
  );
}
