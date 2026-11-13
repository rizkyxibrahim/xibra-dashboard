import {
  defineEventHandler,
  getRequestHeader,
  setResponseStatus,
} from "nuxt/server";
import type { RequestEvent } from "nuxt/server";
import { XibraApiError } from "./xibra-api";

export type BffErrorBody = {
  message: string;
  code: string;
  fields?: Record<string, string[]>;
  retryAfter?: number;
};

/**
 * CSRF defense in depth on top of SameSite=Lax: a browser sends Origin on
 * non-GET requests, and it must match the Host this app was reached on.
 */
export function assertSameOrigin(event: RequestEvent): void {
  const origin = getRequestHeader(event, "origin");
  if (!origin) return;

  let originHost: string;

  try {
    originHost = new URL(origin).host;
  } catch {
    throw new XibraApiError(
      403,
      "CROSS_ORIGIN_REQUEST",
      "The request origin is not allowed.",
    );
  }

  const host = getRequestHeader(event, "host");
  if (!host || originHost !== host) {
    throw new XibraApiError(
      403,
      "CROSS_ORIGIN_REQUEST",
      "The request origin is not allowed.",
    );
  }
}

/**
 * Wrap a BFF handler so every failure becomes a predictable JSON body.
 * Only the message is logged; tokens and request headers never are.
 */
export function defineBffHandler<Result>(
  handler: (event: RequestEvent) => Promise<Result>,
) {
  return defineEventHandler(async (event) => {
    try {
      return await handler(event);
    } catch (error) {
      if (error instanceof XibraApiError) {
        setResponseStatus(event, error.status);

        return {
          message: error.message,
          code: error.code,
          ...(error.fields ? { fields: error.fields } : {}),
          ...(error.retryAfter ? { retryAfter: error.retryAfter } : {}),
        } satisfies BffErrorBody;
      }

      console.error(
        "Xibra dashboard request failed.",
        error instanceof Error ? error.message : "Unknown error",
      );

      setResponseStatus(event, 500);

      return {
        message: "An unexpected error occurred.",
        code: "INTERNAL_SERVER_ERROR",
      } satisfies BffErrorBody;
    }
  });
}
