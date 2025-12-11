"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { Command } from "lucide-react";
import { Link } from "@/shared/infrastructure/i18n/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  mainNavItems,
  secondaryNavItems,
} from "../constants/navigation-config";
import type { UserInfo } from "@/shared/types/navigation";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";

/**
 * Props for the AppSidebar component.
 */
interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  /** User information to display in the footer */
  user: UserInfo;
}

/**
 * Main application sidebar component.
 * Composes SidebarHeader with app branding, SidebarContent with NavMain,
 * and SidebarFooter with NavUser.
 * @param props - Component props including user info and sidebar props
 * @returns Complete sidebar with navigation and user profile
 */
export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const params = useParams<{ spaceId?: string }>();
  const isInSpace = Boolean(params.spaceId);

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Bodo Jerpai</span>
                  <span className="text-muted-foreground truncate text-xs">
                    Enterprise
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={mainNavItems} label="Platform" isInSpace={isInSpace} />
        <NavMain
          items={secondaryNavItems}
          label="Support"
          isInSpace={isInSpace}
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
