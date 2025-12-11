import { type LucideIcon } from "lucide-react";

/**
 * Represents a sub-item within a navigation menu item.
 */
export interface NavSubItem {
  /** Display title for the sub-item */
  title: string;
  /** URL path for navigation */
  url: string;
}

/**
 * Represents a primary navigation menu item with optional nested sub-items.
 */
export interface NavItem {
  /** Display title for the navigation item */
  title: string;
  /** URL path for navigation */
  url: string;
  /** Lucide icon component to display */
  icon: LucideIcon;
  /** Whether this item is currently active */
  isActive?: boolean;
  /** Optional nested sub-items for collapsible menus */
  items?: NavSubItem[];
  /** Whether this item should only be visible when user is in a space */
  spaceOnly?: boolean;
}

/**
 * Represents user information displayed in the sidebar footer.
 */
export interface UserInfo {
  /** User's display name */
  name: string;
  /** User's email address */
  email: string;
  /** Optional URL to user's avatar image */
  avatar?: string;
}
