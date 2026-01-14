"use client";

import { useTranslations } from "next-intl";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { type Trade } from "../schemas";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteTradeDialog } from "./delete-trade-dialog";

/**
 * Props for the TradeView component.
 */
interface TradeViewProps {
  /** Trade data to display */
  trade: Trade;
  /** Space ID for navigation */
  spaceId: number;
}

/**
 * Returns badge variant based on trade status.
 */
function getStatusVariant(
  status: Trade["status"]
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "TX_COMPLETED":
      return "default";
    case "TX_DRAFT":
    case "TX_READY":
      return "secondary";
    case "TX_CANCELED":
    case "TX_RETURN":
      return "destructive";
    default:
      return "outline";
  }
}

/**
 * TradeView component displays detailed information about a single trade.
 * Shows trade details, line items, and actions.
 *
 * @param props - Component props
 * @param props.trade - Trade data to display
 * @param props.spaceId - Space ID for navigation
 * @returns TradeView component with trade details and actions
 */
export function TradeView({ trade, spaceId }: TradeViewProps) {
  const router = useRouter();
  const t = useTranslations("trades");

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "IDR",
    }).format(Number(value));
  };

  const formatDate = (date: string | null | undefined) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex max-w-full flex-col gap-6 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/space/${spaceId}/trades`}>
              <ArrowLeft className="size-4" />
              <span className="sr-only">{t("view.back")}</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">{trade.number}</h1>
            <p className="text-muted-foreground text-sm">
              {formatDate(trade.created_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Edit button */}
          <Button variant="outline" size="sm" className="gap-2" asChild>
            <Link href={`/space/${spaceId}/trades/${trade.id}/edit`}>
              <Edit className="size-4" />
              <span className="hidden sm:inline">{t("actions.edit")}</span>
            </Link>
          </Button>
          <DeleteTradeDialog
            trade={trade}
            onSuccess={() => router.push(`/space/${spaceId}/trades`)}
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
                {t("view.number")}
              </p>
              <p className="font-medium">{trade.number}</p>
            </div>

            <Separator />
            <div className="space-y-1">
              <p className="text-muted-foreground text-sm">
                {t("columns.status")}
              </p>
              <Badge variant={getStatusVariant(trade.status)}>
                {t(`status.${trade.status}`)}
              </Badge>
            </div>

            <Separator />
            <div className="space-y-1">
              <p className="text-muted-foreground text-sm">{t("view.total")}</p>
              <p className="text-lg font-semibold">
                {formatCurrency(trade.total)}
              </p>
            </div>

            {trade.fee && (
              <>
                <Separator />
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">
                    {t("view.fee")}
                  </p>
                  <p className="font-medium">{formatCurrency(trade.fee)}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Timestamps */}
        <Card>
          <CardHeader>
            <CardTitle>{t("view.timestamps")}</CardTitle>
            <CardDescription>{t("view.timestampsDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <p className="text-muted-foreground text-sm">
                {t("view.createdAt")}
              </p>
              <p className="font-medium">{formatDate(trade.created_at)}</p>
            </div>

            {trade.sent_time && (
              <>
                <Separator />
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">
                    {t("view.sentTime")}
                  </p>
                  <p className="font-medium">{formatDate(trade.sent_time)}</p>
                </div>
              </>
            )}

            {trade.received_time && (
              <>
                <Separator />
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">
                    {t("view.receivedTime")}
                  </p>
                  <p className="font-medium">
                    {formatDate(trade.received_time)}
                  </p>
                </div>
              </>
            )}

            {trade.updated_at && (
              <>
                <Separator />
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">
                    {t("view.updatedAt")}
                  </p>
                  <p className="font-medium">{formatDate(trade.updated_at)}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Parties (Sender, Receiver, Handler) */}
        {(trade.sender || trade.receiver || trade.handler) && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>{t("view.parties")}</CardTitle>
              <CardDescription>{t("view.partiesDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                {trade.sender && (
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-sm">
                      {t("view.sender")}
                    </p>
                    <p className="font-medium">{trade.sender.name}</p>
                    {trade.sender.code && (
                      <p className="text-muted-foreground text-xs">
                        {trade.sender.code}
                      </p>
                    )}
                  </div>
                )}
                {trade.receiver && (
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-sm">
                      {t("view.receiver")}
                    </p>
                    <p className="font-medium">{trade.receiver.name}</p>
                    {trade.receiver.code && (
                      <p className="text-muted-foreground text-xs">
                        {trade.receiver.code}
                      </p>
                    )}
                  </div>
                )}
                {trade.handler && (
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-sm">
                      {t("view.handler")}
                    </p>
                    <p className="font-medium">{trade.handler.name}</p>
                    {trade.handler.code && (
                      <p className="text-muted-foreground text-xs">
                        {trade.handler.code}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Child Trades */}
        {trade.children && trade.children.length > 0 && (
          <Card className="w-full min-w-0 overflow-hidden md:col-span-2">
            <CardHeader>
              <CardTitle>{t("view.childTrades")}</CardTitle>
              <CardDescription>
                {t("view.childTradesDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <div className="min-w-[500px] rounded-lg border sm:min-w-0">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>{t("view.childNumber")}</TableHead>
                      <TableHead>{t("view.childStatus")}</TableHead>
                      <TableHead className="text-right">
                        {t("view.childTotal")}
                      </TableHead>
                      <TableHead>{t("view.childCreatedAt")}</TableHead>
                      <TableHead>{t("actions.action")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trade.children.map((child) => (
                      <TableRow key={child.id}>
                        <TableCell className="font-medium">
                          {child.number}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(child.status)}>
                            {t(`status.${child.status}`)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatCurrency(child.total)}
                        </TableCell>
                        <TableCell>{formatDate(child.created_at)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" asChild>
                            <Link
                              href={`/space/${spaceId}/trades/${child.id}`}
                              target="_blank"
                            >
                              {t("actions.view")}
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Line Items */}
        <Card className="w-full min-w-0 overflow-hidden md:col-span-2">
          <CardHeader>
            <CardTitle>{t("view.lineItems")}</CardTitle>
            <CardDescription>{t("view.lineItemsDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {trade.details && trade.details.length > 0 ? (
              <div className="min-w-[600px] rounded-lg border sm:min-w-0">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>{t("view.itemSku")}</TableHead>
                      <TableHead>{t("view.itemType")}</TableHead>
                      <TableHead>{t("view.itemName")}</TableHead>
                      <TableHead className="text-right">
                        {t("view.quantity")}
                      </TableHead>
                      <TableHead className="text-right">
                        {t("view.price")}
                      </TableHead>
                      <TableHead className="text-right">
                        {t("view.discount")}
                      </TableHead>
                      <TableHead>{t("view.itemNotes")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trade.details.map((detail) => (
                      <TableRow key={detail.id}>
                        <TableCell className="font-medium">
                          {detail.item?.sku || "—"}
                        </TableCell>
                        <TableCell>
                          {t(`detailTypes.${detail.model_type}`) || "—"}
                        </TableCell>
                        <TableCell>{detail.item?.name || "—"}</TableCell>
                        <TableCell className="text-right tabular-nums">
                          {detail.quantity}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatCurrency(detail.price.toString())}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {detail.discount.toString() !== "0"
                            ? formatCurrency(detail.discount.toString())
                            : "—"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {detail.notes || "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-muted-foreground py-8 text-center">
                {t("view.noLineItems")}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Description & Notes */}
        {(trade.description ||
          trade.sender_notes ||
          trade.receiver_notes ||
          trade.handler_notes) && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>{t("view.notes")}</CardTitle>
              <CardDescription>{t("view.notesDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {trade.description && (
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">
                    {t("view.description")}
                  </p>
                  <p className="whitespace-pre-wrap">{trade.description}</p>
                </div>
              )}

              {trade.sender_notes && (
                <>
                  <Separator />
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-sm">
                      {t("view.senderNotes")}
                    </p>
                    <p className="whitespace-pre-wrap">{trade.sender_notes}</p>
                  </div>
                </>
              )}

              {trade.receiver_notes && (
                <>
                  <Separator />
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-sm">
                      {t("view.receiverNotes")}
                    </p>
                    <p className="whitespace-pre-wrap">
                      {trade.receiver_notes}
                    </p>
                  </div>
                </>
              )}

              {trade.handler_notes && (
                <>
                  <Separator />
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-sm">
                      {t("view.handlerNotes")}
                    </p>
                    <p className="whitespace-pre-wrap">{trade.handler_notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tags */}
        {trade.tags && trade.tags.length > 0 && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>{t("view.tags")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {trade.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
