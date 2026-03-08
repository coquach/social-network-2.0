import { ModalProvider } from '@/components/providers/modal-providers';
import QueryClientProviders from '@/components/providers/query-client-providers';
import { ApiClientProvider } from '@/components/providers/api-client-provider';
import { SharedProviders } from '@/providers/shared-providers';
import { ThemeProvider } from '@/components/theme-provider';
import { SkipLink } from '@/components/ui/skip-link';
import { siteConfig } from '@/config/site';
import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';
import { SocketProvider } from '@/components/providers/socket-provider';




const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: [
    {
      url: '/logo.svg',
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SkipLink href="#main-content">
          Chuyển đến nội dung chính
        </SkipLink>
        <QueryClientProviders>
          <ClerkProvider
            appearance={{
              theme: 'simple',
              variables: {
                colorPrimary: '#3730A3',
              },
            }}
            afterSignOutUrl="/marketing"
          >
            <ApiClientProvider>
              <SharedProviders>
                <ThemeProvider
                  attribute="class"
                  defaultTheme="light"
                  enableSystem
                  storageKey="sentimeta-theme"
                  disableTransitionOnChange
                >
                  <SocketProvider>
                    <Toaster theme="light" richColors closeButton />
                    <ModalProvider />

                    {children}
                  </SocketProvider>
                </ThemeProvider>
              </SharedProviders>
            </ApiClientProvider>
          </ClerkProvider>
        </QueryClientProviders>
      </body>
    </html>
  );
}
