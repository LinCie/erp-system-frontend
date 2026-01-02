import {
  LayoutDashboard,
  Users,
  Settings,
  HelpCircle,
  Boxes,
  ArrowLeftRight,
} from "lucide-react";
import type { NavItem } from "@/shared/types/navigation";

/**
 * Primary navigation items displayed in the main sidebar content.
 */
export const mainNavItems: NavItem[] = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
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
    title: "Stocks",
    url: "",
    icon: Boxes,
    spaceOnly: true,
    items: [
      {
        title: "Items",
        url: "/items",
        spaceOnly: true,
      },
    ],
  },
  {
    title: "Transactions",
    url: "",
    icon: ArrowLeftRight,
    spaceOnly: true,
    items: [
      {
        title: "Trades",
        url: "/trades",
        spaceOnly: true,
      },
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
