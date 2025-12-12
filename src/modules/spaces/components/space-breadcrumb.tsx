"use client";

import { Fragment } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/shared/infrastructure/i18n";
import { useSpaceStore } from "../store/use-space-store";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface SpaceBreadcrumbProps {
  itemName?: string;
}

/**
 * Breadcrumb navigation for space routes.
 * Automatically builds breadcrumb trail based on current pathname.
 * Uses space store for space name.
 * @param itemName - Optional item name to display instead of ID
 */
export function SpaceBreadcrumb({ itemName }: SpaceBreadcrumbProps) {
  const t = useTranslations("navigation");
  const pathname = usePathname();
  const space = useSpaceStore((state) => state.space);

  // Parse pathname to extract segments: /space/[spaceId]/items/[itemId]
  const segments = pathname.split("/").filter(Boolean);
  const spaceIndex = segments.indexOf("space");

  if (spaceIndex === -1) return null;

  const spaceId = segments[spaceIndex + 1];
  const hasItems = segments.includes("items");
  const itemId = hasItems ? segments[segments.indexOf("items") + 1] : undefined;

  const breadcrumbs: { label: string; href?: string }[] = [
    { label: t("dashboard"), href: "/" },
  ];

  // Add space breadcrumb
  if (spaceId) {
    const isSpacePage = !hasItems;
    breadcrumbs.push({
      label: space?.name ?? `Space ${spaceId}`,
      href: isSpacePage ? undefined : `/space/${spaceId}`,
    });
  }

  // Add items breadcrumb
  if (hasItems) {
    const isItemsPage = !itemId;
    breadcrumbs.push({
      label: t("items"),
      href: isItemsPage ? undefined : `/space/${spaceId}/items`,
    });
  }

  // Add item detail breadcrumb
  if (itemId) {
    breadcrumbs.push({
      label: itemName ?? `Item ${itemId}`,
    });
  }

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        {breadcrumbs.map((crumb, index) => (
          <Fragment key={crumb.label}>
            {index > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {crumb.href ? (
                <BreadcrumbLink asChild>
                  <Link href={crumb.href}>{crumb.label}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
