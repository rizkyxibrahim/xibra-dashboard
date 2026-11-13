import { defineBffHandler } from "../../utils/bff";
import {
  callXibraApi,
  XibraApiError,
  type ApiUser,
} from "../../utils/xibra-api";
import {
  destroySession,
  readSession,
  toSessionUser,
  writeSession,
} from "../../utils/session";

export default defineBffHandler(async (event) => {
  const session = await readSession(event);

  if (!session) {
    throw new XibraApiError(
      401,
      "UNAUTHENTICATED",
      "Authentication is required.",
    );
  }

  let account: ApiUser;

  try {
    // Revalidate on every call so a revoked token or deactivated account
    // ends the dashboard session instead of lingering for eight hours.
    account = await callXibraApi<ApiUser>("/auth/me", { token: session.token });
  } catch (error) {
    if (error instanceof XibraApiError && error.status === 401) {
      await destroySession(event);
    }

    throw error;
  }

  const user = toSessionUser(account);
  await writeSession(event, { ...session, user });

  return { user };
});
