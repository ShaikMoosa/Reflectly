import './globals.css';
import type { Metadata } from 'next';
import { Inter } from "next/font/google";
import { Providers } from './providers';

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  preload: true,
  weight: ['400', '500', '600', '700']
});

export const metadata: Metadata = {
  title: 'Reflectly - Video Transcription App',
  description: 'Upload videos and generate interactive transcripts',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Preload critical assets for better LCP */}
        <link
          rel="preload"
          href="/_next/static/media/c9a5bc6a7c948fb0-s.p.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        {/* Preconnect to critical domains */}
        <link rel="preconnect" href="https://localhost" />
      </head>
      <body className={`${inter.className} bg-gray-50`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
} 