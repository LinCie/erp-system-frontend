"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { deleteTradeAction } from "../actions/delete-trade-action";
import { type Trade } from "../schemas";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

/**
 * Props for the DeleteTradeDialog component.
 */
interface DeleteTradeDialogProps {
  /** The trade to delete */
  trade: Trade;
  /** Callback function called after successful deletion */
  onSuccess?: (tradeId: number) => void;
  /** Custom trigger element (optional) */
  trigger?: React.ReactNode;
}

/**
 * DeleteTradeDialog component displays a confirmation dialog for deleting a trade.
 * Uses AlertDialog for accessible confirmation UI.
 * Calls deleteTradeAction server action and handles loading/error states.
 *
 * @param props - Component props
 * @param props.trade - The trade to delete
 * @param props.onSuccess - Callback function called after successful deletion
 * @param props.trigger - Custom trigger element (optional)
 * @returns DeleteTradeDialog component with confirmation dialog
 */
export function DeleteTradeDialog({
  trade,
  onSuccess,
  trigger,
}: DeleteTradeDialogProps) {
  const t = useTranslations("trades.delete");
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Handles the delete action.
   * Calls the server action and manages loading/success/error states.
   */
  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const result = await deleteTradeAction(trade.id);

      if (result.success) {
        toast.success(result.message ?? t("success"));
        setOpen(false);
        onSuccess?.(trade.id);
      } else {
        toast.error(result.message ?? t("error"));
      }
    } catch {
      toast.error(t("error"));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger ?? (
          <button className="text-destructive focus:text-destructive w-full text-left">
            {t("trigger")}
          </button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("title")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("description", { number: trade.number })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            {t("cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isDeleting}
            className="bg-destructive text-muted hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                {t("deleting")}
              </>
            ) : (
              t("confirm")
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
