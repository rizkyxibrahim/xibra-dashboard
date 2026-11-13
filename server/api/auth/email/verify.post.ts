import { readBody } from "nuxt/server";
import { assertSameOrigin, defineBffHandler } from "../../../utils/bff";
import { callXibraApi } from "../../../utils/xibra-api";

type VerifyEmailBody = {
  token?: unknown;
};

/**
 * Consume an email verification token. Public: the token is the proof.
 *
 * The token travels in the verification link, so it is single-use and
 * short-lived. The BFF never stores or logs it.
 */
export default defineBffHandler(async (event) => {
  assertSameOrigin(event);

  const body = await readBody<VerifyEmailBody>(event);

  await callXibraApi("/auth/email/verify", {
    method: "POST",
    body: {
      token: typeof body?.token === "string" ? body.token.trim() : "",
    },
  });

  return { success: true };
});
