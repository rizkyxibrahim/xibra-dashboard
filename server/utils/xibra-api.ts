import { useRuntimeConfig } from "nuxt/server";

export type ApiUser = {
  id: number;
  name: string;
  username: string;
  email: string | null;
  phone: string | null;
  is_active: boolean;
  email_verified_at: string | null;
  last_login_at: string | null;
  created_at: string | null;
  roles: Array<{ name: string; label: string }>;
};

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  code: string;
  data: T;
  meta: Record<string, unknown> | null;
};

type CallOptions = {
  method?: "GET" | "POST" | "DELETE";
  token?: string;
  body?: Record<string, unknown>;
};

/**
 * An error produced by the API, or by the BFF while talking to it.
 * `status` is what the BFF returns to the browser.
 */
export class XibraApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fields?: Record<string, string[]>;
  readonly retryAfter?: number;

  constructor(
    status: number,
    code: string,
    message: string,
    options: {
      fields?: Record<string, string[]>;
      retryAfter?: number;
      cause?: unknown;
    } = {},
  ) {
    super(message);
    this.name = "XibraApiError";
    this.status = status;
    this.code = code;
    this.fields = options.fields;
    this.retryAfter = options.retryAfter;

    if (options.cause !== undefined) {
      this.cause = options.cause;
    }
  }
}

export async function callXibraApi<T>(
  path: string,
  options: CallOptions = {},
): Promise<T> {
  const baseUrl = useRuntimeConfig().xibraApiBaseUrl.replace(/\/+$/, "");
  const url = `${baseUrl}/api/v1${path.startsWith("/") ? path : `/${path}`}`;

  let response: {
    status: number;
    ok: boolean;
    _data?: unknown;
    headers: Headers;
  };

  try {
    response = await $fetch.raw<ApiEnvelope<T>>(url, {
      method: options.method ?? "GET",
      body: options.body,
      headers: {
        Accept: "application/json",
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
      ignoreResponseError: true,
      retry: 0,
      timeout: 10_000,
    });
  } catch (cause) {
    throw new XibraApiError(
      502,
      "API_UNAVAILABLE",
      "The Xibra API could not be reached. Please try again shortly.",
      { cause },
    );
  }

  const payload: unknown = response._data;
  const envelope = isEnvelope(payload) ? payload : undefined;

  if (response.ok && envelope?.success === true) {
    return envelope.data as T;
  }

  const status = response.status;

  throw new XibraApiError(
    status,
    envelope?.code || `HTTP_${status}`,
    envelope?.message || defaultMessage(status),
    {
      // docs/api/conventions.md section 5: field-level validation errors
      // travel in `meta.errors`. `data` is checked as a fallback so a future
      // envelope change cannot silently drop them again.
      fields:
        status === 422
          ? extractFields(envelope?.meta, envelope?.data)
          : undefined,
      retryAfter: parseRetryAfter(response.headers.get("retry-after")),
    },
  );
}

function isEnvelope(value: unknown): value is ApiEnvelope<unknown> {
  if (typeof value !== "object" || value === null) return false;

  const candidate = value as { success?: unknown; message?: unknown };
  return (
    typeof candidate.success === "boolean" &&
    typeof candidate.message === "string"
  );
}

function extractFields(
  meta: unknown,
  data: unknown,
): Record<string, string[]> | undefined {
  return readErrors(meta) ?? readErrors(data);
}

function readErrors(value: unknown): Record<string, string[]> | undefined {
  if (typeof value !== "object" || value === null) return undefined;

  const errors = (value as { errors?: unknown }).errors;
  if (typeof errors !== "object" || errors === null) return undefined;

  const fields: Record<string, string[]> = {};

  for (const [field, messages] of Object.entries(errors)) {
    if (Array.isArray(messages)) {
      fields[field] = messages.filter(
        (message): message is string => typeof message === "string",
      );
    }
  }

  return Object.keys(fields).length > 0 ? fields : undefined;
}

function parseRetryAfter(value: string | null): number | undefined {
  if (!value) return undefined;

  const seconds = Number.parseInt(value, 10);
  return Number.isFinite(seconds) && seconds > 0 ? seconds : undefined;
}

function defaultMessage(status: number): string {
  if (status === 401) return "Authentication is required.";
  if (status === 403)
    return "You do not have permission to perform this action.";
  if (status === 404) return "The requested resource was not found.";
  if (status === 429) return "Too many requests. Please try again later.";
  if (status >= 500) return "The Xibra API is temporarily unavailable.";

  return "The request could not be completed.";
}
