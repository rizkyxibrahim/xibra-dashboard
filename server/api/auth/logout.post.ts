import { assertSameOrigin, defineBffHandler } from "../../utils/bff";
import { callXibraApi, XibraApiError } from "../../utils/xibra-api";
import { destroySession, readSession } from "../../utils/session";

export default defineBffHandler(async (event) => {
  assertSameOrigin(event);

  const session = await readSession(event);
  await destroySession(event);

  if (session) {
    try {
      await callXibraApi("/auth/logout", {
        method: "POST",
        token: session.token,
      });
    } catch (error) {
      // The local session is already cleared; a failed revoke must not block
      // sign-out. Log the status only, never the token.
      console.warn("Xibra API token revocation failed.", {
        status: error instanceof XibraApiError ? error.status : "unknown",
      });
    }
  }

  return { success: true };
});
