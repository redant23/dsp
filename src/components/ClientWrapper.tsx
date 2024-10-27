'use client';

import dynamic from 'next/dynamic';
import { ThemeProvider } from "@src/components/ThemeProvider";
import Header from '@src/components/Header';
import { Toaster } from '@src/components/ui/toaster';

const ClientWrapper = dynamic(() => Promise.resolve(({ children }: { children: React.ReactNode }) => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <Header />
    {children}
    <Toaster />
  </ThemeProvider>
)), {
  ssr: false
});

export default ClientWrapper;
