import './globals.css';
import './styles/tiptap.css';
import type { Metadata } from 'next';
import { Inter } from "next/font/google";
import { Providers } from './providers';
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import ChunkErrorBoundary from './components/ChunkErrorBoundary';
import ChunkRetryScript from './components/ChunkRetryScript';
import dynamic from 'next/dynamic';

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
  weight: ['400', '500', '600', '700']
});

export const metadata: Metadata = {
  title: 'Reflectly - Video Transcription App',
  description: 'Upload videos and generate interactive transcripts',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <ChunkRetryScript />
      </head>
      <body className={`${inter.className} ${inter.variable} font-sans`}>
        <ClerkProvider
          appearance={{
            baseTheme: dark,
            variables: { colorPrimary: 'rgb(59 130 246)' },
          }}
        >
          <Providers>
            <ChunkErrorBoundary>
              {children}
            </ChunkErrorBoundary>
          </Providers>
        </ClerkProvider>
      </body>
    </html>
  );
} 