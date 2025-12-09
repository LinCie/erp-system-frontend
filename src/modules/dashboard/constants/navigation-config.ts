import { LayoutDashboard, Users, Settings, HelpCircle } from "lucide-react";
import type { NavItem } from "../types/navigation";

/**
 * Primary navigation items displayed in the main sidebar content.
 */
export const mainNavItems: NavItem[] = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
    isActive: true,
  },
  {
    title: "Users",
    url: "/users",
    icon: Users,
    items: [
      { title: "All Users", url: "/users" },
      { title: "Roles", url: "/users/roles" },
    ],
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    items: [
      { title: "General", url: "/settings" },
      { title: "Security", url: "/settings/security" },
    ],
  },
];

/**
 * Secondary navigation items displayed below the main navigation.
 */
export const secondaryNavItems: NavItem[] = [
  {
    title: "Help",
    url: "/help",
    icon: HelpCircle,
  },
];
