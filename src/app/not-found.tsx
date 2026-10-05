import Link from "next/link";
export default function NotFound() {
  return (
    <section className="container-x py-28 text-center">
      <div className="eyebrow">404</div>
      <h1 className="mt-3 text-[28px] font-semibold text-ink">페이지를 찾을 수 없습니다.</h1>
      <Link href="/prompts" className="btn-primary mt-8">프롬프트 스토어로</Link>
    </section>
  );
}
