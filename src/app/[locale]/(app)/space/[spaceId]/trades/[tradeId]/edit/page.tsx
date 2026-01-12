import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { TradeEdit } from "@/modules/trades/components/trade-edit";
import { getTradeAction } from "@/modules/trades/actions/get-trade-action";
import { Button } from "@/components/ui/button";
import { Link } from "@/shared/infrastructure/i18n";

type Props = {
  params: Promise<{ locale: string; spaceId: string; tradeId: string }>;
};

/**
 * Generates internationalized metadata for the trade edit page.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, tradeId } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.tradeEdit" });

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
 * Trade edit page server component.
 * Fetches trade data server-side and displays edit form.
 */
export default async function TradeEditPage({ params }: Props) {
  const { spaceId, tradeId } = await params;

  // Fetch trade data
  const result = await getTradeAction(Number(tradeId));

  // Handle error or not found
  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <>
      {/* Header with Back Button */}
      <div className="mb-6 flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/space/${spaceId}/trades/${tradeId}`}>
            <ArrowLeft className="size-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{result.data.number}</h1>
        </div>
      </div>

      {/* Edit Form */}
      <TradeEdit
        tradeId={Number(tradeId)}
        spaceId={Number(spaceId)}
        initialData={result.data}
      />
    </>
  );
}
