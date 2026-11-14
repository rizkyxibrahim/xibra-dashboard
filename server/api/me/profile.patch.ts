import { readBody } from "nuxt/server";
import { assertSameOrigin, defineBffHandler } from "../../utils/bff";
import { callXibraApi, XibraApiError } from "../../utils/xibra-api";
import { destroySession, readSession } from "../../utils/session";

const EDITABLE_FIELDS = ["name", "username", "phone"] as const;

/**
 * Forward only the profile fields the user may edit. Everything else in the
 * body is dropped here and rejected again by the API.
 */
export default defineBffHandler(async (event) => {
  assertSameOrigin(event);

  const session = await readSession(event);

  if (!session) {
    throw new XibraApiError(
      401,
      "UNAUTHENTICATED",
      "Authentication is required.",
    );
  }

  const body = (await readBody<Record<string, unknown>>(event)) ?? {};
  const payload: Record<string, unknown> = {};

  for (const field of EDITABLE_FIELDS) {
    if (field in body) {
      const value = body[field];

      payload[field] = typeof value === "string" ? value.trim() : value;
    }
  }

  try {
    return await callXibraApi("/me/profile", {
      method: "PATCH",
      token: session.token,
      body: payload,
    });
  } catch (error) {
    if (error instanceof XibraApiError && error.status === 401) {
      await destroySession(event);
    }

    throw error;
  }
});
