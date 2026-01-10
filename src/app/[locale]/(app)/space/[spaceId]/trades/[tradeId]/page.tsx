import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { TradeView } from "@/modules/trades/components/trade-view";
import { getTradeAction } from "@/modules/trades/actions/get-trade-action";

type Props = {
  params: Promise<{ locale: string; spaceId: string; tradeId: string }>;
};

/**
 * Generates internationalized metadata for the trade view page.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, tradeId } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.tradeView" });

  // Fetch trade to get number for title
  const result = await getTradeAction(Number(tradeId));
  const tradeNumber =
    result.success && result.data ? result.data.number : "Trade";

  return {
    title: t("title", { number: tradeNumber }),
    description: t("description"),
  };
}

/**
 * Trade view page server component.
 * Fetches trade data server-side and displays detailed information.
 */
export default async function TradeViewPage({ params }: Props) {
  const { spaceId, tradeId } = await params;

  // Fetch trade data
  const result = await getTradeAction(Number(tradeId));

  // Handle error or not found
  if (!result.success || !result.data) {
    notFound();
  }

  return <TradeView initialTrade={result.data} spaceId={Number(spaceId)} />;
}
