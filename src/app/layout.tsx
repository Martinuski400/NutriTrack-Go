import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Changed font for variety
import './globals.css';
import { cn } from '@/lib/utils';
import BottomNav from '@/components/layout/bottom-nav'; // Import BottomNav
import { Toaster } from "@/components/ui/toaster"; // Import Toaster

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'NutriTrack Go',
  description: 'Monitor your calories and water intake.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          inter.variable
        )}
      >
        {/* Add padding to bottom to prevent content from being hidden by BottomNav */}
        <main className="pb-20">{children}</main>
        <BottomNav />
        <Toaster />
      </body>
    </html>
  );
}
