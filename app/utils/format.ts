const dateTimeFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

export function formatDateTime(value: string | null): string {
  if (!value) return "Not available";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";

  return `${dateTimeFormatter.format(date)} UTC`;
}

/**
 * Only allow same-origin absolute paths as a post-login redirect target.
 */
export function safeRedirectPath(value: unknown): string {
  if (typeof value !== "string") return "/";
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\"))
    return "/";

  return value;
}
