"use client";

import { useEffect, useRef } from "react";
import { DRAFT_STORAGE_KEY } from "@/config";
import { decodeDraft, encodeDraft } from "@/lib/core/draft-codec";
import type { Answers, Draft } from "@/types";

const DEBOUNCE_MS = 400;

function safeStorage<T>(operation: () => T, fallback: T): T {
	try {
		return operation();
	} catch {
		return fallback;
	}
}

function readStoredDraft(): string | null {
	return safeStorage(
		() => window.localStorage.getItem(DRAFT_STORAGE_KEY),
		null,
	);
}

function writeStoredDraft(serialized: string): void {
	safeStorage(() => {
		window.localStorage.setItem(DRAFT_STORAGE_KEY, serialized);
		return true;
	}, false);
}

export function clearStoredDraft(): void {
	safeStorage(() => {
		window.localStorage.removeItem(DRAFT_STORAGE_KEY);
		return true;
	}, false);
}

interface UseDraftPersistenceParams {
	answers: Partial<Answers>;
	activeStep: number;
	onRestore: (draft: Draft) => void;
	onCorrupted: () => void;
}

export function useDraftPersistence({
	answers,
	activeStep,
	onRestore,
	onCorrupted,
}: UseDraftPersistenceParams): void {
	const hasHydrated = useRef(false);

	useEffect(() => {
		const raw = readStoredDraft();
		if (raw !== null) {
			const result = decodeDraft(raw);
			if (result.ok) {
				onRestore(result.draft);
			} else {
				clearStoredDraft();
				onCorrupted();
			}
		}
		hasHydrated.current = true;
	}, [onRestore, onCorrupted]);

	useEffect(() => {
		if (!hasHydrated.current) {
			return;
		}
		const timer = window.setTimeout(() => {
			const draft: Draft = { answers, activeStep, updatedAt: Date.now() };
			writeStoredDraft(encodeDraft(draft));
		}, DEBOUNCE_MS);
		return () => {
			window.clearTimeout(timer);
		};
	}, [answers, activeStep]);
}
