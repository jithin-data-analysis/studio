import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Using Inter as a clean modern font
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster'; // Import Toaster

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'SATS - Student Academic Tracking System',
  description:
    'GenAI-Powered Academic Tracking Platform for Students, Teachers, and Admins.',
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
        {children}
        <Toaster /> {/* Add Toaster component here */}
      </body>
    </html>
  );
}
