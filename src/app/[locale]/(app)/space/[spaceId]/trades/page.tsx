import { getTranslations } from "next-intl/server";
import { TradeList } from "@/modules/trades/components/trade-list";
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

/**
 * Generates internationalized metadata for the trades page.
 */
export async function generateMetadata({ params }: Props) {
  await params; // Await params to satisfy Next.js requirements
  const t = await getTranslations("metadata.trades");
  return {
    title: t("title"),
    description: t("description"),
  };
}

/**
 * Trades page server component.
 * Renders the TradeList client component which fetches data on mount.
 */
export default async function TradesPage({ params }: Props) {
  const { spaceId } = await params;
  const t = await getTranslations("trades");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <TradeList spaceId={+spaceId} />
      </CardContent>
    </Card>
  );
}
