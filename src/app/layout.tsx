import React from 'react';
import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/providers';
import { PWAProvider } from '@/components/pwa/PWAProvider';
import { InstallPrompt } from '@/components/pwa/InstallPrompt';
import { UpdateNotification } from '@/components/pwa/UpdateNotification';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Menu Planner',
  description: 'Create and share meal plans effortlessly',
  manifest: '/manifest.json',

  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Menu Planner',
  },
  themeColor: '#ffffff',
  icons: {
    icon: [
      {
        url: '/favicon.svg',
        type: 'image/svg+xml',
      },
      {
        url: '/favicon.ico',
        sizes: '32x32',
      },
    ],
    apple: [
      {
        url: '/icons/icon-152x152.png',
        sizes: '152x152',
        type: 'image/png',
      },
      {
        url: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
    ],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#ffffff',
  interactiveWidget: 'resizes-content',
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <PWAProvider>
          <Providers>
            {children}
            <InstallPrompt />
            <UpdateNotification />
          </Providers>
        </PWAProvider>
      </body>
    </html>
  );
} 