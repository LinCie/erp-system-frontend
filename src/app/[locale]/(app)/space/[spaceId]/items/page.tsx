import { getTranslations } from "next-intl/server";
import { ItemList } from "@/modules/items/components/item-list";
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <ItemList spaceId={+spaceId} />
      </CardContent>
    </Card>
  );
}
