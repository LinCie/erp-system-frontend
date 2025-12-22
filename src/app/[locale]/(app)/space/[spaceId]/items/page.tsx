import { getTranslations } from "next-intl/server";
import { getManyItemsAction } from "@/modules/items/actions/get-items-action";
import { ItemList } from "@/modules/items/components/item-list";
import { DEFAULT_PAGINATION_META } from "@/shared/constants/pagination";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Props = {
  params: Promise<{ spaceId: string }>;
};

export default async function ItemsPage({ params }: Props) {
  const { spaceId } = await params;
  const t = await getTranslations("items");

  const result = await getManyItemsAction({
    spaceId: +spaceId,
    type: "full",
    limit: 10,
    withInventory: true,
  });

  const initialData =
    result.success && result.data
      ? result.data
      : { data: [], metadata: DEFAULT_PAGINATION_META };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <ItemList initialData={initialData} spaceId={+spaceId} />
      </CardContent>
    </Card>
  );
}
