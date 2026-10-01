import { PolicyPage } from "@/components/PolicyPage";
export const metadata = { title: "개인정보처리방침" };
export default function Page() {
  return (
    <PolicyPage
      title="개인정보처리방침"
      sections={[
        { h: "수집 항목", body: ["이름, 휴대전화 번호, 이메일 주소", "결제 정보(결제번호, 결제 상태) — 카드 정보는 PayApp이 처리하며 당사는 저장하지 않습니다.", "다운로드 기록(일시, IP)"] },
        { h: "이용 목적", body: ["결제 처리 및 구매 확인", "구매 콘텐츠 제공 및 재접속 인증", "부정 이용 방지"] },
        { h: "보관 기간", body: ["관련 법령(전자상거래법 등)에 따른 기간 동안 보관 후 파기합니다."] },
      ]}
    />
  );
}
