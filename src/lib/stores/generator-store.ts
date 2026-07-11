import { create } from "zustand";
import type { Answers } from "@/types";

interface GeneratorState {
	answers: Answers | null;
	setAnswers: (answers: Answers) => void;
	reset: () => void;
}

export const useGeneratorStore = create<GeneratorState>((set) => ({
	answers: null,
	setAnswers: (answers) => set({ answers }),
	reset: () => set({ answers: null }),
}));
