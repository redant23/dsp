import type { Metadata } from "next";
import '@src/styles/globals.scss';
import Header from '@src/components/Header';

import { ThemeProvider } from "@src/components/ThemeProvider";
export const metadata: Metadata = {
  title: "프랩 | 초중등 과학 탐구 교육 전문 학원",
  description: `단순히 지식만을 가르치는 기존 학원에서는 변화하는 입시에서 남들과 다른 경쟁력을 만들어낼 수 없습니다. 과학적 사고력, 문제 해결 능력, 정보 탐색 능력, 창의력, 의사소통 능력, 협업 능력 등을 키워줄 수 있는 "탐구 교육"을 하는 plab만 가능합니다.`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Header />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
