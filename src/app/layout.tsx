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
    "현장에서 축적한 마케팅 전략과 실행 프로세스를 AI에서 바로 사용할 수 있는 프롬프트로 제공합니다. 단일 프롬프트 200,000원 또는 미라클 멤버십 월 50,000원.",
  icons: { icon: "/favicon.svg" },
  openGraph: { type: "website", siteName: "MIRACLE PROMPT", locale: "ko_KR" },
};

export const viewport: Viewport = { themeColor: "#152238", width: "device-width", initialScale: 1 };

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
