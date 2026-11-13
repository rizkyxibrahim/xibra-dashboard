export type ApiErrorPayload = {
  message: string;
  code: string;
  fields?: Record<string, string[]>;
  retryAfter?: number;
};

function statusOf(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null) return undefined;

  const candidate = error as {
    statusCode?: unknown;
    status?: unknown;
    response?: { status?: unknown };
  };

  for (const value of [
    candidate.statusCode,
    candidate.status,
    candidate.response?.status,
  ]) {
    if (typeof value === "number") return value;
  }

  return undefined;
}

export function isUnauthorized(error: unknown): boolean {
  return statusOf(error) === 401;
}

export function toApiError(error: unknown): ApiErrorPayload {
  if (typeof error === "object" && error !== null) {
    const data = (error as { data?: unknown }).data;
    if (isApiErrorPayload(data)) return data;
  }

  return {
    message: "The request could not be completed. Please try again.",
    code: "UNKNOWN",
  };
}

function isApiErrorPayload(value: unknown): value is ApiErrorPayload {
  if (typeof value !== "object" || value === null) return false;

  const candidate = value as { message?: unknown; code?: unknown };
  return (
    typeof candidate.message === "string" && typeof candidate.code === "string"
  );
}

export function fieldError(
  payload: ApiErrorPayload | null,
  field: string,
): string | undefined {
  return payload?.fields?.[field]?.[0];
}
