import '../globals.css';
import type { Metadata } from 'next';
import { Inter } from "next/font/google";
import Link from 'next/link';
import { ThemeProvider } from 'next-themes';

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
  weight: ['400', '500', '600', '700']
});

export const metadata: Metadata = {
  title: 'Reflectly - Video Transcription and AI Chat',
  description: 'Transcribe videos and chat with AI to get insights from your content',
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} ${inter.variable} bg-white dark:bg-[#1f1f1f] text-gray-900 dark:text-gray-100`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <header className="fixed top-0 w-full bg-white/75 dark:bg-[#1f1f1f]/90 backdrop-blur-md z-50 py-4 border-b border-gray-200 dark:border-[#383838]">
            <div className="container mx-auto px-4 flex justify-between items-center">
              <Link href="/landing" className="text-2xl font-bold">
                Reflectly
              </Link>
              <nav className="space-x-6 hidden md:flex items-center">
                <Link href="#features" className="hover:text-blue-500 transition-colors">
                  Features
                </Link>
                <Link href="#testimonials" className="hover:text-blue-500 transition-colors">
                  Testimonials
                </Link>
                <Link href="#pricing" className="hover:text-blue-500 transition-colors">
                  Pricing
                </Link>
                <Link href="#faq" className="hover:text-blue-500 transition-colors">
                  FAQ
                </Link>
                <Link 
                  href="/sign-in" 
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
              </nav>
              
              {/* Mobile menu button - we'll implement a proper mobile menu later */}
              <button className="md:hidden p-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              </button>
            </div>
          </header>
          
          <main className="pt-24">
            {children}
          </main>
          
          <footer className="bg-gray-100 dark:bg-[#252525] py-12 mt-20">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                  <h3 className="text-lg font-bold mb-4">Reflectly</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Your all-in-one platform for video transcription and AI chat.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-4">Product</h3>
                  <ul className="space-y-2">
                    <li><Link href="#features" className="text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors">Features</Link></li>
                    <li><Link href="#pricing" className="text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors">Pricing</Link></li>
                    <li><Link href="#faq" className="text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors">FAQ</Link></li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-4">Company</h3>
                  <ul className="space-y-2">
                    <li><Link href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors">About</Link></li>
                    <li><Link href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors">Blog</Link></li>
                    <li><Link href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors">Contact</Link></li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-4">Legal</h3>
                  <ul className="space-y-2">
                    <li><Link href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors">Privacy Policy</Link></li>
                    <li><Link href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors">Terms of Service</Link></li>
                  </ul>
                </div>
              </div>
              <div className="border-t border-gray-200 dark:border-[#383838] mt-8 pt-8 text-center text-gray-600 dark:text-gray-400">
                &copy; {new Date().getFullYear()} Reflectly. All rights reserved.
              </div>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
} 