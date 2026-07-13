"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { cn } from "@/lib/utils";

interface NavItem {
	label: string;
	href: string;
}

const NAV_ITEMS: NavItem[] = [
	{ label: "How It Works", href: "/#how-it-works" },
	{ label: "Features", href: "/#features" },
];

export function Header() {
	const prefersReducedMotion = useReducedMotion();
	const [menuOpen, setMenuOpen] = useState(false);

	const closeMenu = (): void => setMenuOpen(false);

	return (
		<header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/70 backdrop-blur-xl">
			<div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
				<Link
					href="/"
					className="flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
					aria-label="Origin — Home"
					onClick={closeMenu}
				>
					<Logo size={28} />
				</Link>

				<nav
					aria-label="Primary"
					className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 md:flex"
				>
					{NAV_ITEMS.map((item) => (
						<Link
							key={item.href}
							href={item.href}
							className="group relative text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:text-foreground"
						>
							{item.label}
							<span className="absolute -bottom-1 left-0 h-px w-0 bg-linear-to-r from-ignition-orange to-electric-cyan transition-all duration-300 group-hover:w-full" />
						</Link>
					))}
				</nav>

				<div className="flex items-center gap-2">
					<Link
						href="/create"
						className="group relative hidden items-center justify-center overflow-hidden rounded-full bg-white px-5 py-2 text-sm font-bold text-black transition-transform duration-100 ease-out transform-gpu hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background shadow-glow-orange hover:shadow-glow-cyan sm:inline-flex"
					>
						<span className="relative z-10">Write Your Origin</span>
						<span className="absolute inset-0 z-0 bg-linear-to-r from-ignition-orange to-electric-cyan opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
					</Link>

					<button
						type="button"
						className="inline-flex size-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background md:hidden"
						aria-label={menuOpen ? "Close menu" : "Open menu"}
						aria-expanded={menuOpen}
						aria-controls="mobile-nav"
						onClick={() => setMenuOpen((open) => !open)}
					>
						{menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
					</button>
				</div>
			</div>

			<AnimatePresence>
				{menuOpen ? (
					<motion.nav
						id="mobile-nav"
						aria-label="Mobile"
						className="overflow-hidden border-t border-border/40 bg-background/95 backdrop-blur-xl md:hidden"
						initial={prefersReducedMotion ? false : { height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={
							prefersReducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }
						}
						transition={{ duration: 0.25, ease: "easeInOut" }}
					>
						<div className="flex flex-col gap-1 px-4 py-4 sm:px-6">
							{NAV_ITEMS.map((item) => (
								<Link
									key={item.href}
									href={item.href}
									onClick={closeMenu}
									className="rounded-lg px-3 py-3 text-base font-medium text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
								>
									{item.label}
								</Link>
							))}
							<Link
								href="/create"
								onClick={closeMenu}
								className={cn(
									"group relative mt-2 inline-flex items-center justify-center overflow-hidden rounded-full bg-white px-5 py-3 text-sm font-bold text-black",
									"transition-transform duration-100 ease-out transform-gpu hover:scale-[1.02] active:scale-95",
									"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background shadow-glow-orange",
								)}
							>
								<span className="relative z-10">Write Your Origin</span>
								<span className="absolute inset-0 z-0 bg-linear-to-r from-ignition-orange to-electric-cyan opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
							</Link>
						</div>
					</motion.nav>
				) : null}
			</AnimatePresence>
		</header>
	);
}
