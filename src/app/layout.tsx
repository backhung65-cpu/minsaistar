import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

// SNS 미리보기 이미지는 절대 주소가 필요하므로, NEXT_PUBLIC_SITE_URL이 없으면 Vercel 주소를 사용
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ||
  (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ||
  "http://localhost:3000";

const SITE_TITLE = "MIRACLE PROMPT — 민진홍의 마케팅 사고를 프롬프트로 소유하세요";
const SITE_DESC =
  "민진홍 소장의 마케팅 전략 마스터 프롬프트와 전자책 출판 지원 솔루션. 단품 220,000원, 미라클 멤버십 월 55,000원으로 전부 이용.";
const OG_IMAGE = { url: "/og.png", width: 1200, height: 630, alt: "MIRACLE PROMPT — 민진홍의 마케팅 사고를 프롬프트로 소유하세요" };

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: SITE_TITLE, template: "%s | MIRACLE PROMPT" },
  description: SITE_DESC,
  applicationName: "MIRACLE PROMPT",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    siteName: "MIRACLE PROMPT",
    locale: "ko_KR",
    url: "/",
    title: SITE_TITLE,
    description: SITE_DESC,
    images: [OG_IMAGE],
  },
  twitter: { card: "summary_large_image", title: SITE_TITLE, description: SITE_DESC, images: ["/og.png"] },
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
