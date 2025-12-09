"use client";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

/**
 * Breadcrumb item configuration.
 */
export interface BreadcrumbItemConfig {
  /** Display label for the breadcrumb */
  label: string;
  /** Optional href for navigation (if not provided, renders as current page) */
  href?: string;
}

/**
 * Props for the SiteHeader component.
 */
interface SiteHeaderProps {
  /** Optional breadcrumb items to display */
  breadcrumbs?: BreadcrumbItemConfig[];
}

/**
 * Sticky header component for the dashboard layout.
 * Contains a sidebar toggle button and breadcrumb navigation.
 * Breadcrumbs are hidden on mobile (screens < 640px).
 * @param props - Component props including optional breadcrumbs
 * @returns Sticky header with toggle and navigation
 */
export function SiteHeader({ breadcrumbs }: SiteHeaderProps) {
  return (
    <header className="bg-background sticky top-0 z-50 flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 hidden h-4 sm:block" />
      <Breadcrumb className="hidden sm:block">
        <BreadcrumbList>
          {breadcrumbs && breadcrumbs.length > 0 ? (
            breadcrumbs.map((item, index) => (
              <BreadcrumbItem key={index}>
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              </BreadcrumbItem>
            ))
          ) : (
            <BreadcrumbItem>
              <BreadcrumbPage>Dashboard</BreadcrumbPage>
            </BreadcrumbItem>
          )}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  );
}
