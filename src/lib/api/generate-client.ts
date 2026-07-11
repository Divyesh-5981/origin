import type {
  GenerateFailedResponse,
  GenerateRefusalResponse,
  GenerateRequest,
  GenerateSuccessResponse,
} from "@/types";

export type GenerationOutcome =
  | { status: "success"; recordId: string; shareUrl: string | null }
  | { status: "refused"; message: string }
  | { status: "duplicate" }
  | { status: "error"; message: string };

const GENERIC_ERROR_MESSAGE =
  "Something interrupted your story. Please try again.";

const HTTP_OK = 200;
const HTTP_DUPLICATE = 409;
const HTTP_REFUSED = 422;

async function readJson<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function requestGeneration(
  input: GenerateRequest,
): Promise<GenerationOutcome> {
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (response.status === HTTP_OK) {
    const data = await readJson<GenerateSuccessResponse>(response);
    if (data === null) {
      return { status: "error", message: GENERIC_ERROR_MESSAGE };
    }
    return {
      status: "success",
      recordId: data.recordId,
      shareUrl: data.shareUrl,
    };
  }

  if (response.status === HTTP_DUPLICATE) {
    return { status: "duplicate" };
  }

  if (response.status === HTTP_REFUSED) {
    const data = await readJson<GenerateRefusalResponse>(response);
    return {
      status: "refused",
      message: data?.message ?? GENERIC_ERROR_MESSAGE,
    };
  }

  const data = await readJson<GenerateFailedResponse>(response);
  return { status: "error", message: data?.message ?? GENERIC_ERROR_MESSAGE };
}
