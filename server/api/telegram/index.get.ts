import { defineBffHandler } from "../../utils/bff";
import { callXibraApi, XibraApiError } from "../../utils/xibra-api";
import { destroySession, readSession } from "../../utils/session";

/**
 * The authenticated user's Telegram link status. Read-only, so no
 * same-origin check is required.
 */
export default defineBffHandler(async (event) => {
  const session = await readSession(event);

  if (!session) {
    throw new XibraApiError(
      401,
      "UNAUTHENTICATED",
      "Authentication is required.",
    );
  }

  try {
    return await callXibraApi("/telegram", { token: session.token });
  } catch (error) {
    if (error instanceof XibraApiError && error.status === 401) {
      await destroySession(event);
    }

    throw error;
  }
});
