import Link from 'next/link';
import { Logo } from '@/components/shared/logo';

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background/50">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Origin — Home"
        >
          <Logo size={24} />
        </Link>
        <p className="text-sm text-muted-foreground">
          Every passion has a beginning. Tell yours like a movie.
        </p>
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Origin
        </p>
      </div>
    </footer>
  );
}
