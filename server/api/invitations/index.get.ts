import { getQuery } from "nuxt/server";
import { defineBffHandler } from "../../utils/bff";
import { callXibraApiPage, XibraApiError } from "../../utils/xibra-api";
import { destroySession, readSession } from "../../utils/session";

const DEFAULT_PER_PAGE = 15;
const MAX_PER_PAGE = 100;

function positiveInt(value: unknown, fallback: number): number {
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

/**
 * Paginated invitation list for the Owner's dashboard.
 *
 * Only the API decides who may read it (`invitations.manage`). The BFF
 * clamps paging parameters so malformed input never reaches the API.
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

  const query = getQuery(event);
  const page = positiveInt(query.page, 1);
  const perPage = Math.min(
    positiveInt(query.per_page, DEFAULT_PER_PAGE),
    MAX_PER_PAGE,
  );

  try {
    return await callXibraApiPage<unknown>(
      `/invitations?page=${page}&per_page=${perPage}`,
      { token: session.token },
    );
  } catch (error) {
    if (error instanceof XibraApiError && error.status === 401) {
      await destroySession(event);
    }

    throw error;
  }
});
