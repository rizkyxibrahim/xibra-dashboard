export type LayoutTheme = "light" | "dark";

/**
 * Shell preferences.
 *
 * Only the theme is persisted, and it lives in a readable cookie because the
 * `data-theme` attribute has to be rendered on the server to avoid a flash of
 * the wrong palette. The cookie holds no secrets.
 */
export function useShell() {
  const cookie = useCookie<LayoutTheme>("xibra_theme", {
    default: () => "light",
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });

  const theme = useState<LayoutTheme>("shell:theme", () =>
    cookie.value === "dark" ? "dark" : "light",
  );

  function setTheme(next: LayoutTheme) {
    theme.value = next;
    cookie.value = next;
  }

  function toggleTheme() {
    setTheme(theme.value === "dark" ? "light" : "dark");
  }

  return { theme, setTheme, toggleTheme };
}
