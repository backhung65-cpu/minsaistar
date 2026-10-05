import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "MIRACLE PROMPT — 민진홍의 마케팅 사고를 프롬프트로 소유하세요",
    template: "%s | MIRACLE PROMPT",
  },
  description:
    "민진홍 소장의 AI 비서 GPT 솔루션과 마케팅 프롬프트를 한곳에서. 미라클 멤버십 월 55,000원, 프리미엄 프롬프트 220,000원.",
  icons: { icon: "/favicon.svg" },
  openGraph: { type: "website", siteName: "MIRACLE PROMPT", locale: "ko_KR" },
};

export const viewport: Viewport = { themeColor: "#1d1d1f", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
