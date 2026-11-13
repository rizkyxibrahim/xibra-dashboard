import { defineBffHandler } from "../../utils/bff";
import { callXibraApi, XibraApiError } from "../../utils/xibra-api";
import { destroySession, readSession } from "../../utils/session";

type ApiAuditLog = {
  id: number;
  action: string;
  created_at: string | null;
};

/** How many recent events the overview renders. */
const LIMIT = 8;

/**
 * The authenticated user's own security activity.
 *
 * Only the fields the overview renders are forwarded: IP address and user
 * agent stay on the server, because the browser has no use for them.
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
    const logs = await callXibraApi<ApiAuditLog[]>(
      `/me/audit-logs?per_page=${LIMIT}&page=1`,
      { token: session.token },
    );

    return {
      items: logs.map((log) => ({
        id: log.id,
        action: log.action,
        createdAt: log.created_at,
      })),
    };
  } catch (error) {
    if (error instanceof XibraApiError && error.status === 401) {
      await destroySession(event);
    }

    throw error;
  }
});
