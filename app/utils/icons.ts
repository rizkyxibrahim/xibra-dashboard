import {
  Activity,
  Check,
  ChevronDown,
  Clock,
  Copy,
  Eye,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Moon,
  Phone,
  RefreshCw,
  Share2,
  Shield,
  Sun,
  Trash2,
  User,
  UserPlus,
  X,
  type LucideIcon,
} from "lucide-vue-next";

/**
 * Icon names used across the dashboard, mapped to Lucide components.
 *
 * Lucide is bundled with the app: each icon is a tree-shaken Vue component,
 * so no icon data is requested from an external service. Add a name here
 * before using it in AppIcon.
 */
export const iconComponents = {
  menu: Menu,
  close: X,
  dashboard: LayoutDashboard,
  sun: Sun,
  moon: Moon,
  "chevron-down": ChevronDown,
  "log-out": LogOut,
  user: User,
  "user-plus": UserPlus,
  mail: Mail,
  phone: Phone,
  shield: Shield,
  clock: Clock,
  check: Check,
  activity: Activity,
  eye: Eye,
  trash: Trash2,
  share: Share2,
  copy: Copy,
  refresh: RefreshCw,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof iconComponents;
