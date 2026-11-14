import { readBody } from "nuxt/server";
import { assertSameOrigin, defineBffHandler } from "../../utils/bff";
import { callXibraApi, XibraApiError } from "../../utils/xibra-api";
import { destroySession, readSession } from "../../utils/session";

/**
 * Create an invitation. The response carries the one-time code and link;
 * the BFF never logs or stores them.
 *
 * Only whitelisted fields are forwarded. The API validates everything else,
 * including that the role exists and is never `owner`.
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

  const hours = body.expires_in_hours;

  if (hours !== undefined && hours !== null && hours !== "") {
    const parsed = typeof hours === "number" ? hours : Number(hours);

    if (!Number.isInteger(parsed)) {
      throw new XibraApiError(
        422,
        "VALIDATION_ERROR",
        "The given data was invalid.",
        {
          fields: {
            expires_in_hours: ["Expiration must be a whole number of hours."],
          },
        },
      );
    }

    payload.expires_in_hours = parsed;
  }

  if (typeof body.role === "string" && body.role.trim() !== "") {
    payload.role = body.role.trim();
  }

  if (typeof body.note === "string" && body.note.trim() !== "") {
    payload.note = body.note.trim();
  }

  try {
    return await callXibraApi("/invitations", {
      method: "POST",
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
