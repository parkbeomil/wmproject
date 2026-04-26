import type { Metadata } from "next";
import Providers from "@/providers/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Proofreading Ops MVP",
  description: "교과서·참고서 교정/교열 지원 서비스 MVP"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
