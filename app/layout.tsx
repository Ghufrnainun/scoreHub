import React from 'react';
import type { Metadata } from 'next';
import {
  Barlow,
  Barlow_Condensed,
  Bebas_Neue,
  Literata,
} from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';
import ConvexClientProvider from '@/components/convex-client-provider';
import { Toaster } from '@/components/ui/sonner';

const barlow = Barlow({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-body',
});
const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-display',
});
const bebas = Bebas_Neue({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-bebas',
});
const literata = Literata({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-literata',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://scorehub.app'),
  title: 'PB UNDIP | Pendaftaran & Scoreboard',
  description:
    'Sistem pendaftaran atlet dan scoreboard realtime PB UNDIP untuk operator, wasit, dan display venue.',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${barlow.className} ${barlowCondensed.variable} ${bebas.variable} ${literata.variable} antialiased`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground focus:shadow"
        >
          Skip to main content
        </a>
        <ConvexClientProvider>{children}</ConvexClientProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
