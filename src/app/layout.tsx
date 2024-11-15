import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import './assets/Modeling/scss/style.scss'
const pretendard = localFont({
  src: "./fonts/Pretendard-Regular.woff",
  variable: "--font-pretendard-sans",
});

export const metadata: Metadata = {
  title: "한국건설기술연구원",
  description: "WebGL 기반 교량 해석 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${pretendard.variable} ${pretendard.variable}`}>
        {children}
      </body>
    </html>
  );
}
