// Adding debugging logs
console.log('Layout file is loading');
import './globals.css';
import './styles/tiptap.css';
import type { Metadata } from 'next';
import { Inter } from "next/font/google";
import { Providers } from './providers';
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';

console.log('Imports completed');

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
  weight: ['400', '500', '600', '700']
});

console.log('Inter font initialized');

export const metadata: Metadata = {
  title: 'Reflectly - Video Transcription App',
  description: 'Upload videos and generate interactive transcripts',
};

console.log('Metadata exported');

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  console.log('RootLayout function called');
  return (
    <html lang="en">
      <body className={`${inter.className} ${inter.variable} font-sans`}>
        <ClerkProvider
          appearance={{
            baseTheme: dark,
            variables: { colorPrimary: 'rgb(59 130 246)' },
          }}
        >
          <Providers>
            {children}
          </Providers>
        </ClerkProvider>
      </body>
    </html>
  );
} 