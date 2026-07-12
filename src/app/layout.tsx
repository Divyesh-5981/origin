import type { Metadata, Viewport } from 'next';
import { Bricolage_Grotesque, Inter, JetBrains_Mono } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { AppProviders } from '@/components/providers/app-providers';
import { isClerkConfigured } from '@/lib/auth/clerk-config';
import './globals.css';

const fontHeading = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
});

const fontBody = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const fontMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
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
    { media: '(prefers-color-scheme: light)', color: 'hsl(40 40% 97%)' },
    { media: '(prefers-color-scheme: dark)', color: 'hsl(252 33% 7%)' },
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
      className={`${fontHeading.variable} ${fontBody.variable} ${fontMono.variable} h-full`}
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
            <AppProviders>{children}</AppProviders>
          </ClerkProvider>
        ) : (
          <AppProviders>{children}</AppProviders>
        )}
      </body>
    </html>
  );
}
