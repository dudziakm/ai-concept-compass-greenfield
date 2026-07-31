import { ZodError } from "zod";

import type { ReviewError } from "./schemas.js";

export type ReviewErrorCode = ReviewError["error"]["code"];

export class ReviewInfrastructureError extends Error {
  readonly code: ReviewErrorCode;

  constructor(code: ReviewErrorCode, message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "ReviewInfrastructureError";
    this.code = code;
  }
}

export function toReviewError(error: unknown): ReviewError {
  if (error instanceof ReviewInfrastructureError) {
    return { error: { code: error.code, message: error.message } };
  }

  if (error instanceof ZodError) {
    return {
      error: {
        code: "INVALID_INPUT",
        message: error.issues
          .map((issue) => issue.message)
          .join("; ")
          .slice(0, 500),
      },
    };
  }

  if (error instanceof DOMException && error.name === "TimeoutError") {
    return {
      error: {
        code: "TIMEOUT",
        message: "Reviewer przekroczył limit 60 sekund.",
      },
    };
  }

  return {
    error: {
      code: "PROVIDER_ERROR",
      message: "Reviewer nie mógł zakończyć wywołania providera.",
    },
  };
}
