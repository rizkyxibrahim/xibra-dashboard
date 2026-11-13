import type { IconName } from "~/utils/icons";

export type ActivityItem = {
  id: number;
  action: string;
  createdAt: string | null;
};

export type ActivityDescription = {
  label: string;
  icon: IconName;
};

/**
 * Audit actions the API records today. Keeping the mapping here means a new
 * API action degrades to a readable label instead of breaking the list.
 */
const descriptions: Record<string, ActivityDescription> = {
  "user.email_verification_sent": {
    label: "Verification email sent",
    icon: "mail",
  },
  "user.email_verified": { label: "Email address verified", icon: "check" },
  "user.password_reset_issued": {
    label: "Password reset requested",
    icon: "shield",
  },
  "user.password_reset_completed": {
    label: "Password changed",
    icon: "shield",
  },
  "user.deactivated": { label: "Account deactivated", icon: "user" },
  "user.reactivated": { label: "Account reactivated", icon: "user" },
  "invitation.created": { label: "Invitation created", icon: "mail" },
  "invitation.revoked": { label: "Invitation revoked", icon: "close" },
  "invitation.redeemed": { label: "Invitation redeemed", icon: "check" },
  "invitation.expired": { label: "Invitation expired", icon: "clock" },
  "telegram.link_code_issued": {
    label: "Telegram link code issued",
    icon: "shield",
  },
  "telegram.linked": { label: "Telegram account linked", icon: "user" },
  "telegram.unlinked": { label: "Telegram account unlinked", icon: "user" },
};

export function describeActivity(action: string): ActivityDescription {
  const known = descriptions[action];
  if (known) return known;

  const words = action.replace(/[._]+/g, " ").trim();

  return {
    label:
      words === ""
        ? "Account activity"
        : words.charAt(0).toUpperCase() + words.slice(1),
    icon: "activity",
  };
}
