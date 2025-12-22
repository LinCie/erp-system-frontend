import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ItemView } from "@/modules/items/components/item-view";
import { getItemAction } from "@/modules/items/actions/get-item-action";

type Props = {
  params: Promise<{ locale: string; spaceId: string; itemId: string }>;
};

/**
 * Generates internationalized metadata for the item view page.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, itemId } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.itemView" });

  // Fetch item to get name for title
  const result = await getItemAction(Number(itemId));
  const itemName = result.success && result.data ? result.data.name : "Item";

  return {
    title: t("title", { name: itemName }),
    description: t("description"),
  };
}

/**
 * Item view page server component.
 * Fetches item data server-side and displays detailed information.
 */
export default async function ItemViewPage({ params }: Props) {
  const { spaceId, itemId } = await params;

  // Fetch item data
  const result = await getItemAction(Number(itemId), { withInventory: true });

  // Handle error or not found
  if (!result.success || !result.data) {
    notFound();
  }

  return <ItemView item={result.data} spaceId={Number(spaceId)} />;
}
