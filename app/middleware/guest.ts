export default defineNuxtRouteMiddleware(async () => {
  const user = useAuthUser();
  if (user.value) return navigateTo("/");

  const current = await loadAuthUser();
  if (current) return navigateTo("/");

  return undefined;
});
