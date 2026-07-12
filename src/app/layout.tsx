import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { AppProviders } from '@/components/providers/app-providers';
import { Header } from '@/components/shared/header';
import { Footer } from '@/components/shared/footer';
import { isClerkConfigured } from '@/lib/auth/clerk-config';
import './globals.css';

const fontInter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Origin — Tell your story like a movie',
    template: '%s · Origin',
  },
  description:
    'Origin transforms a few personal answers into a cinematic, interactive origin story you can share with the world.',
  applicationName: 'Origin',
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    shortcut: ['/favicon.svg'],
    apple: [{ url: '/favicon.svg' }],
  },
  keywords: [
    'origin story',
    'cinematic',
    'AI storytelling',
    'passion',
    'share',
  ],
  authors: [{ name: 'Origin' }],
  openGraph: {
    title: 'Origin — Tell your story like a movie',
    description:
      'Every passion has a beginning. Turn yours into a cinematic, shareable origin story.',
    siteName: 'Origin',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Origin — Tell your story like a movie',
    description:
      'Every passion has a beginning. Turn yours into a cinematic, shareable origin story.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'hsl(220 20% 96%)' },
    { media: '(prefers-color-scheme: dark)', color: 'hsl(228 45% 5%)' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fontInter.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:font-heading focus:text-body focus:font-semibold focus:text-primary-foreground"
        >
          Skip to content
        </a>
        {isClerkConfigured() ? (
          <ClerkProvider>
            <AppProviders>
              <Header />
              {children}
              <Footer />
            </AppProviders>
          </ClerkProvider>
        ) : (
          <AppProviders>
            <Header />
            {children}
            <Footer />
          </AppProviders>
        )}
      </body>
    </html>
  );
}
