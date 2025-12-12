"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { type Item } from "../types/schemas";
import { Link, useRouter } from "@/shared/infrastructure/i18n";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { UpdateItemModal } from "./update-item-modal";
import { DeleteItemDialog } from "./delete-item-dialog";
import { RichTextRenderer } from "@/components/rich-text-renderer";

/**
 * Props for the ItemView component.
 */
interface ItemViewProps {
  /** Item data to display */
  item: Item;
  /** Space ID for navigation */
  spaceId: number;
}

/**
 * ItemView component displays detailed information about a single item.
 * Shows all item fields in a card layout with edit and delete actions.
 *
 * @param props - Component props
 * @param props.item - Item data to display
 * @param props.spaceId - Space ID for navigation
 * @returns ItemView component with item details and actions
 *
 * @example
 * ```tsx
 * <ItemView item={itemData} spaceId={123} />
 * ```
 */
export function ItemView({ item, spaceId }: ItemViewProps) {
  const [viewItem, setViewItem] = useState(item);
  const router = useRouter();
  const t = useTranslations("items");

  function handleUpdateItem(updatedItem: Item) {
    setViewItem(updatedItem);
  }

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "IDR",
    }).format(Number(value));
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/space/${spaceId}/items`}>
              <ArrowLeft className="size-4" />
              <span className="sr-only">{t("view.back")}</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">{viewItem.name}</h1>
            {viewItem.sku && (
              <p className="text-muted-foreground text-sm">
                SKU: {viewItem.sku}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <UpdateItemModal
            item={viewItem}
            onSuccess={handleUpdateItem}
            trigger={
              <Button variant="outline" size="sm" className="gap-2">
                <Edit className="size-4" />
                <span className="hidden sm:inline">{t("actions.edit")}</span>
              </Button>
            }
          />
          <DeleteItemDialog
            item={viewItem}
            onSuccess={() => router.push(`/space/${spaceId}/items`)}
            trigger={
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:bg-destructive hover:text-muted gap-2"
              >
                <Trash2 className="size-4" />
                <span className="hidden sm:inline">{t("actions.delete")}</span>
              </Button>
            }
          />
        </div>
      </div>

      {/* Content */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t("view.basicInfo")}</CardTitle>
            <CardDescription>{t("view.basicInfoDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <p className="text-muted-foreground text-sm">
                {t("fields.name")}
              </p>
              <p className="font-medium">{viewItem.name}</p>
            </div>

            {viewItem.sku && (
              <>
                <Separator />
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">
                    {t("fields.sku")}
                  </p>
                  <p className="font-medium">{viewItem.sku}</p>
                </div>
              </>
            )}

            {viewItem.code && (
              <>
                <Separator />
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">
                    {t("fields.code")}
                  </p>
                  <p className="font-medium">{viewItem.code}</p>
                </div>
              </>
            )}

            <Separator />
            <div className="space-y-1">
              <p className="text-muted-foreground text-sm">
                {t("columns.status")}
              </p>
              <Badge
                variant={
                  viewItem.status === "active"
                    ? "default"
                    : viewItem.status === "inactive"
                      ? "secondary"
                      : "outline"
                }
              >
                {t(`status.${viewItem.status}`)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t("view.pricing")}</CardTitle>
            <CardDescription>{t("view.pricingDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <p className="text-muted-foreground text-sm">
                {t("fields.price")}
              </p>
              <p className="text-lg font-semibold">
                {formatCurrency(viewItem.price)}
              </p>
            </div>

            <Separator />
            <div className="space-y-1">
              <p className="text-muted-foreground text-sm">
                {t("fields.cost")}
              </p>
              <p className="font-medium">{formatCurrency(viewItem.cost)}</p>
            </div>

            <Separator />
            <div className="space-y-1">
              <p className="text-muted-foreground text-sm">
                {t("fields.weight")}
              </p>
              <p className="font-medium">{viewItem.weight}</p>
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        {viewItem.description && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>{t("fields.description")}</CardTitle>
            </CardHeader>
            <CardContent>
              <RichTextRenderer editorState={viewItem.description} />
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        {viewItem.notes && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>{t("fields.notes")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {viewItem.notes}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
