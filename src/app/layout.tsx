import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { UserProvider } from '@/contexts/UserContext';
import AppHeader from '@/components/layout/AppHeader';
import BottomNav from '@/components/layout/BottomNav';
import { Toaster } from "@/components/ui/toaster";
import { cn } from '@/lib/utils';
import { TonConnectProvider } from '@/contexts/TonConnectProvider';
import { FirebaseClientProvider } from '@/firebase';
import { AlertDialogProvider } from '@/contexts/AlertDialogContext';
import { ThemeProvider } from '@/components/ThemeProvider';
import { RocketProvider } from '@/contexts/RocketContext';

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
    <html lang="en" suppressHydrationWarning>
      <head>
      </head>
      <body className={cn("font-body antialiased font-bold")} suppressHydrationWarning>
        <Script
            src="https://telegram.org/js/telegram-web-app.js"
            strategy="beforeInteractive"
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <FirebaseClientProvider>
            <TonConnectProvider>
              <AlertDialogProvider>
                <UserProvider>
                  <RocketProvider>
                    <div className="flex flex-col min-h-screen">
                      <AppHeader />
                      <main className="flex-grow container mx-auto px-4 pt-8 pb-28 md:pb-8 max-w-2xl">
                        {children}
                      </main>
                      <BottomNav />
                    </div>
                    <Toaster />
                  </RocketProvider>
                </UserProvider>
              </AlertDialogProvider>
            </TonConnectProvider>
          </FirebaseClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
