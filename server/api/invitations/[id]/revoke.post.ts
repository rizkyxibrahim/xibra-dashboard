import { getRouterParam } from "nuxt/server";
import { assertSameOrigin, defineBffHandler } from "../../../utils/bff";
import { callXibraApi, XibraApiError } from "../../../utils/xibra-api";
import { destroySession, readSession } from "../../../utils/session";

/**
 * Revoke an unused invitation. Ownership and state rules are enforced by
 * the API; a malformed id is rejected here without reaching it.
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

  const id = getRouterParam(event, "id");

  if (!id || !/^\d+$/.test(id)) {
    throw new XibraApiError(
      404,
      "NOT_FOUND",
      "The requested resource was not found.",
    );
  }

  try {
    return await callXibraApi(`/invitations/${id}/revoke`, {
      method: "POST",
      token: session.token,
    });
  } catch (error) {
    if (error instanceof XibraApiError && error.status === 401) {
      await destroySession(event);
    }

    throw error;
  }
});
