import { readBody } from "nuxt/server";
import { assertSameOrigin, defineBffHandler } from "../../utils/bff";
import { callXibraApi, type ApiUser } from "../../utils/xibra-api";
import { toSessionUser, writeSession } from "../../utils/session";

type LoginBody = {
  identifier?: unknown;
  password?: unknown;
};

export default defineBffHandler(async (event) => {
  assertSameOrigin(event);

  const body = await readBody<LoginBody>(event);

  const result = await callXibraApi<{ token: string; user: ApiUser }>(
    "/auth/login",
    {
      method: "POST",
      body: {
        identifier: typeof body?.identifier === "string" ? body.identifier : "",
        password: typeof body?.password === "string" ? body.password : "",
        device_name: "xibra-dashboard",
      },
    },
  );

  const user = toSessionUser(result.user);
  await writeSession(event, {
    token: result.token,
    user,
    issuedAt: Date.now(),
  });

  // The token never leaves the server.
  return { user };
});
