"use client";

import { ChevronRight } from "lucide-react";
import { Link } from "@/shared/infrastructure/i18n/navigation";
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
import type { NavItem } from "@/shared/types/navigation";

/**
 * Props for the NavMain component.
 */
interface NavMainProps {
  /** Array of navigation items to display */
  items: NavItem[];
  /** Optional label for the navigation group */
  label?: string;
  /** Whether the user is currently in a space context */
  isInSpace?: boolean;
}

/**
 * Primary navigation menu component for the sidebar.
 * Renders collapsible menu items with icons and labels.
 * Supports nested sub-items using Collapsible component.
 * Filters out spaceOnly items when not in a space context.
 * @param props - Component props containing navigation items
 * @returns Navigation menu with collapsible sections
 */
export function NavMain({
  items,
  label = "Navigation",
  isInSpace = false,
}: NavMainProps) {
  const filteredItems = items.filter(
    (item) => !item.spaceOnly || (item.spaceOnly && isInSpace)
  );

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarMenu>
        {filteredItems.map((item) =>
          item.items && item.items.length > 0 ? (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.isActive}
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
                        <SidebarMenuSubButton asChild>
                          <Link href={subItem.url}>
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
                isActive={item.isActive}
              >
                <Link href={item.url}>
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
