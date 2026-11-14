import { assertSameOrigin, defineBffHandler } from "../../utils/bff";
import { callXibraApi, XibraApiError } from "../../utils/xibra-api";
import { destroySession, readSession } from "../../utils/session";

/**
 * Unlink the Telegram account. The API ends the link; the bot stops acting
 * for this account on its next request.
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

  try {
    return await callXibraApi("/telegram", {
      method: "DELETE",
      token: session.token,
    });
  } catch (error) {
    if (error instanceof XibraApiError && error.status === 401) {
      await destroySession(event);
    }

    throw error;
  }
});
