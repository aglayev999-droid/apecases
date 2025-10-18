import type { Metadata } from 'next';
import './globals.css';
import { UserProvider } from '@/contexts/UserContext';
import AppHeader from '@/components/layout/AppHeader';
import BottomNav from '@/components/layout/BottomNav';
import { Toaster } from "@/components/ui/toaster";
import { Inter, Quantico } from 'next/font/google';
import { cn } from '@/lib/utils';
import { TonConnectProvider } from '@/contexts/TonConnectProvider';
import { FirebaseClientProvider } from '@/firebase';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const quantico = Quantico({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-quantico',
});


export const metadata: Metadata = {
  title: '1CASE',
  description: 'Open cases and win big!',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={cn("font-body antialiased", inter.variable, quantico.variable)} suppressHydrationWarning>
        <FirebaseClientProvider>
          <TonConnectProvider>
            <UserProvider>
              <div className="flex flex-col min-h-screen">
                <AppHeader />
                <main className="flex-grow container mx-auto px-4 pt-8 pb-28 md:pb-8 max-w-2xl">
                  {children}
                </main>
                <BottomNav />
              </div>
              <Toaster />
            </UserProvider>
          </TonConnectProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
