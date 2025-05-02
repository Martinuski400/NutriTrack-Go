import type { Metadata, Viewport } from 'next'; // Import Viewport
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import BottomNav from '@/components/layout/bottom-nav';
import { Toaster } from "@/components/ui/toaster";
import ServiceWorkerRegistration from '@/components/layout/service-worker-registration'; // Import the component

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

// Standard Metadata including PWA manifest
export const metadata: Metadata = {
  title: 'NutriTrack Go',
  description: 'Monitor your calories and water intake.',
  manifest: '/manifest.json', // Link to the PWA manifest file
  // Additional PWA and iOS specific tags
  applicationName: 'NutriTrack Go',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default', // Or 'black-translucent'
    title: 'NutriTrack Go',
    // startupImage: [ // Optional: Define startup images for iOS
    //   { url: '/splash/iphone5_splash.png', media: '(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)' },
    // ],
  },
  formatDetection: {
    telephone: false,
  },
  // Icons for PWA and Apple Touch Icon
   icons: {
    icon: [ // Standard favicon/icons
      { url: '/favicon.ico', sizes: 'any' }, // Example, ensure you have this file
      { url: '/icons/icon-192x192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icons/icon-512x512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [ // Apple touch icons
       { url: '/icons/apple-touch-icon.png', sizes: '180x180' }, // Example, ensure you have this file
    ],
   },
};

// Viewport configuration for theme color and other mobile settings
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' }, // Light theme background
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },  // Dark theme background (approx 222.2 84% 4.9%)
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1, // Prevent zooming, common for app-like experiences
  // userScalable: false, // Also prevents zooming, use with caution for accessibility
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* The manifest link is automatically added by Next.js via the metadata export */}
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
        <ServiceWorkerRegistration /> {/* Add the registration component */}
      </body>
    </html>
  );
}
