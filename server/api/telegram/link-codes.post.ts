import { assertSameOrigin, defineBffHandler } from "../../utils/bff";
import { callXibraApi, XibraApiError } from "../../utils/xibra-api";
import { destroySession, readSession } from "../../utils/session";

/**
 * Issue a one-time link code. The code is returned once to the browser and
 * is never logged or stored by the BFF.
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
    return await callXibraApi("/telegram/link-codes", {
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
