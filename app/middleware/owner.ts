/**
 * Route guard only. It keeps the page out of the navigation flow for
 * non-owners; the API still enforces `invitations.manage` on every request.
 */
export default defineNuxtRouteMiddleware(async () => {
  const user = useAuthUser();
  const current = user.value ?? (await loadAuthUser());

  if (current?.roles.some((role) => role.name === "owner")) return;

  return navigateTo("/");
});
