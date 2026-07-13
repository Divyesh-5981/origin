"use client";

import Link from "next/link";
import {
	motion,
	useReducedMotion,
	useScroll,
	useTransform,
	type Variants,
} from "motion/react";
import { ChevronDown, Sparkles } from "lucide-react";
import { useRef } from "react";
import { HeroVisual } from "@/components/sections/hero-visual";

const containerVariants: Variants = {
	hidden: {},
	visible: {
		transition: { staggerChildren: 0.1, delayChildren: 0.2 },
	},
};

const itemVariants: Variants = {
	hidden: { opacity: 0, filter: "blur(10px)", y: 20 },
	visible: {
		opacity: 1,
		filter: "blur(0px)",
		y: 0,
		transition: { duration: 1, ease: [0.16, 1, 0.3, 1] },
	},
};

export function HeroLanding() {
	const prefersReducedMotion = useReducedMotion();
	const containerRef = useRef<HTMLElement>(null);

	const { scrollYProgress } = useScroll({
		target: containerRef,
		offset: ["start start", "end start"],
	});
	const { scrollY } = useScroll();

	const textY = useTransform(scrollYProgress, [0, 1], [0, -100]);
	const textOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
	const textScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);
	const scrollIndicatorOpacity = useTransform(scrollY, [0, 160], [1, 0]);

	return (
		<main
			ref={containerRef}
			className="relative flex min-h-[110vh] flex-1 items-center justify-center overflow-hidden pt-20"
		>
			{/* Base background color layer */}
			<div className="absolute inset-0 bg-background -z-50" />

			{/* 3D scene — fixed position */}
			<motion.div
				className="pointer-events-none absolute inset-0 z-10"
				aria-hidden
			>
				<HeroVisual
					scrollProgress={prefersReducedMotion ? undefined : scrollYProgress}
				/>
			</motion.div>

			{/* Shifting Ambient Neon Grid Lines */}
			{!prefersReducedMotion && (
				<div className="pointer-events-none absolute inset-0 z-0 opacity-20">
					<div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,240,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,69,0,0.05)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
					<motion.div
						className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-200px,rgba(0,240,255,0.15),transparent)]"
						animate={{
							opacity: [0.5, 0.8, 0.5],
						}}
						transition={{
							duration: 8,
							repeat: Infinity,
							ease: "easeInOut",
						}}
					/>
				</div>
			)}

			{/* Cinematic Film Grain Overlay */}
			<div
				className="pointer-events-none absolute inset-0 z-20 bg-film-grain mix-blend-overlay opacity-30"
				aria-hidden
			/>

			{/* Cinematic Vignette Overlay */}
			<div
				className="pointer-events-none absolute inset-0 z-20 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.9)_100%)]"
				aria-hidden
			/>

			{/* Hero content */}
			<motion.section
				className="sticky top-0 z-30 flex min-h-screen w-full flex-col items-center justify-center text-center px-4"
				style={{
					y: prefersReducedMotion ? 0 : textY,
					opacity: prefersReducedMotion ? 1 : textOpacity,
					scale: prefersReducedMotion ? 1 : textScale,
				}}
			>
				<motion.div
					variants={containerVariants}
					initial={prefersReducedMotion ? false : "hidden"}
					animate="visible"
					className="flex flex-col items-center max-w-4xl"
				>
					<motion.div
						className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-md transition-colors hover:bg-white/10"
						variants={itemVariants}
					>
						<Sparkles className="size-3.5 text-ignition-orange" />
						<span>The Cinematic Storytelling Engine</span>
					</motion.div>

					<motion.h1
						className="text-[4rem] font-medium leading-[1.1] tracking-tight text-foreground sm:text-[5.5rem] md:text-[6.5rem] lg:text-[7.5rem] relative"
						variants={itemVariants}
					>
						{/* Ambient behind-text glow */}
						<div className="absolute inset-0 -z-10 bg-gradient-to-r from-ignition-orange/10 to-electric-cyan/10 blur-[80px] rounded-full" />
						Every passion has a <br />
						<span className="relative text-transparent bg-clip-text bg-gradient-to-r from-ignition-orange via-white to-electric-cyan font-bold pb-2 pr-2 animate-pulse-slow">
							beginning.
						</span>
					</motion.h1>

					<motion.p
						className="mt-8 max-w-2xl text-balance text-lg text-muted-foreground sm:text-xl leading-relaxed"
						variants={itemVariants}
					>
						Origin transforms a few personal answers into a cinematic,
						interactive story that feels like the opening sequence of a movie.
						Tell yours, and share it with the world.
					</motion.p>

					<motion.div
						className="mt-12 flex flex-col gap-4 sm:flex-row"
						variants={itemVariants}
					>
						<Link
							href="/create"
							className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-white px-8 py-4 text-base font-bold text-black transition-transform duration-100 ease-out transform-gpu hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background shadow-glow-orange hover:shadow-glow-cyan"
						>
							<span className="relative z-10">Write Your Origin</span>
							<span className="absolute inset-0 -z-0 bg-gradient-to-r from-ignition-orange to-electric-cyan opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
						</Link>
					</motion.div>
				</motion.div>
			</motion.section>

			{/* Scroll indicator */}
			<motion.div
				className="pointer-events-none fixed bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
				aria-hidden
				style={{ opacity: scrollIndicatorOpacity }}
			>
				<motion.div
					className="flex flex-col items-center gap-2"
					initial={prefersReducedMotion ? false : { opacity: 0 }}
					animate={
						prefersReducedMotion ? { opacity: 0.5 } : { opacity: [0, 1, 0] }
					}
					transition={
						prefersReducedMotion
							? undefined
							: { duration: 2, repeat: Infinity, ease: "easeInOut", delay: 2 }
					}
				>
					<span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
						Scroll to Discover
					</span>
					<ChevronDown
						className="size-5 text-muted-foreground"
						strokeWidth={2}
					/>
				</motion.div>
			</motion.div>
		</main>
	);
}
