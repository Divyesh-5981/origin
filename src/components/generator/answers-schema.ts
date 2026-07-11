import { z } from "zod";

const requiredText = (label: string) =>
	z.string().refine((value) => value.trim().length > 0, {
		message: `${label} is required.`,
	});

export const answersSchema = z.object({
	name: requiredText("Your name"),
	profession: requiredText("Your profession"),
	country: z.string().optional(),
	passion: requiredText("A passion"),
	originMoment: requiredText("The origin moment"),
	lowestPoint: requiredText("The lowest point"),
	turningPoint: requiredText("The turning point"),
	dream: requiredText("Your dream"),
	oneSentence: requiredText("A one-sentence description"),
});

export type AnswersForm = z.infer<typeof answersSchema>;

export const EMPTY_ANSWERS: AnswersForm = {
	name: "",
	profession: "",
	country: "",
	passion: "",
	originMoment: "",
	lowestPoint: "",
	turningPoint: "",
	dream: "",
	oneSentence: "",
};
