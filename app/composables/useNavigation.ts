export type NavigationItem = {
  label: string;
  to: string;
  /** Role names allowed to see the item. Omit for every authenticated user. */
  roles?: string[];
};

const items: NavigationItem[] = [{ label: "Overview", to: "/" }];

/**
 * Role-aware navigation.
 *
 * The API remains the authorization boundary; this only keeps links the
 * current user cannot use out of the interface. Permission-based filtering
 * needs effective permissions from `/api/v1/auth/me`, which is not exposed
 * yet; that is a follow-up decision.
 */
export function useNavigation() {
  const user = useAuthUser();

  return computed(() =>
    items.filter((item) => {
      if (!item.roles) return true;
      return (
        user.value?.roles.some((role) => item.roles?.includes(role.name)) ??
        false
      );
    }),
  );
}
