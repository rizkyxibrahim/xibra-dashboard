export default defineNuxtRouteMiddleware(async (to) => {
  const user = useAuthUser();
  if (user.value) return;

  const current = await loadAuthUser();
  if (current) return;

  return navigateTo({
    path: "/login",
    query: to.fullPath === "/" ? {} : { redirect: to.fullPath },
  });
});
