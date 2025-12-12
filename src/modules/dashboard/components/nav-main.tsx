"use client";

import { ChevronRight } from "lucide-react";
import { Link, usePathname } from "@/shared/infrastructure/i18n/navigation";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import type { NavItem, NavSubItem } from "@/shared/types/navigation";

/**
 * Props for the NavMain component.
 */
interface NavMainProps {
  /** Array of navigation items to display */
  items: NavItem[];
  /** Optional label for the navigation group */
  label?: string;
  /** Current space ID for space-scoped navigation */
  spaceId?: string;
}

/**
 * Primary navigation menu component for the sidebar.
 * Renders collapsible menu items with icons and labels.
 * Supports nested sub-items using Collapsible component.
 * Filters out spaceOnly items when not in a space context.
 * Dynamically determines active state based on current pathname.
 * @param props - Component props containing navigation items
 * @returns Navigation menu with collapsible sections
 */
export function NavMain({
  items,
  label = "Navigation",
  spaceId,
}: NavMainProps) {
  const pathname = usePathname();
  const filteredItems = items.filter(
    (item) => !item.spaceOnly || (item.spaceOnly && spaceId)
  );

  /**
   * Returns the URL with spaceId prefix if the item is space-scoped.
   */
  const getUrl = (url: string, spaceOnly?: boolean) =>
    spaceOnly && spaceId ? `/space/${spaceId}${url}` : url;

  /**
   * Checks if a URL matches the current pathname.
   * For root URL ("/"), requires exact match.
   * For other URLs, checks if pathname starts with the URL.
   */
  const isUrlActive = (url: string, spaceOnly?: boolean): boolean => {
    const fullUrl = getUrl(url, spaceOnly);
    if (fullUrl === "/") {
      return pathname === "/";
    }
    return pathname === fullUrl || pathname.startsWith(`${fullUrl}/`);
  };

  /**
   * Checks if a nav item or any of its sub-items is active.
   */
  const isItemActive = (item: NavItem): boolean => {
    if (item.items && item.items.length > 0) {
      return item.items.some((subItem) =>
        isUrlActive(subItem.url, subItem.spaceOnly)
      );
    }
    return isUrlActive(item.url, item.spaceOnly);
  };

  /**
   * Checks if a sub-item is active.
   */
  const isSubItemActive = (subItem: NavSubItem): boolean => {
    return isUrlActive(subItem.url, subItem.spaceOnly);
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarMenu>
        {filteredItems.map((item) =>
          item.items && item.items.length > 0 ? (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={isItemActive(item)}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title}>
                    <item.icon />
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={isSubItemActive(subItem)}
                        >
                          <Link href={getUrl(subItem.url, subItem.spaceOnly)}>
                            <span>{subItem.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ) : (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                isActive={isItemActive(item)}
              >
                <Link href={getUrl(item.url, item.spaceOnly)}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
