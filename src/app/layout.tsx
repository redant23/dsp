import type { Metadata } from "next";
import { Analytics } from '@vercel/analytics/react';
import { Providers } from "@src/components/Providers";

import '@src/styles/globals.css';
import ClientWrapper from '@src/components/ClientWrapper';

export const metadata: Metadata = {
  title: "DSP | Dividend Stocks Portfolio",
  description: `월배당 포트폴리오를 관리할 수 있는 웹서비스`,
  icons: {
    icon: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <Providers>
          <ClientWrapper>
            {children}
          </ClientWrapper>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
