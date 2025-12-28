"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { deleteItemAction } from "../actions/delete-item-action";
import { type Item } from "../schemas";
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
 * Props for the DeleteItemDialog component.
 */
interface DeleteItemDialogProps {
  /** The item to delete */
  item: Item;
  /** Callback function called after successful deletion */
  onSuccess?: (itemId: number) => void;
  /** Custom trigger element (optional) */
  trigger?: React.ReactNode;
}

/**
 * DeleteItemDialog component displays a confirmation dialog for deleting an item.
 * Uses AlertDialog for accessible confirmation UI.
 * Calls deleteItemAction server action and handles loading/error states.
 *
 * @param props - Component props
 * @param props.item - The item to delete
 * @param props.onSuccess - Callback function called after successful deletion
 * @param props.trigger - Custom trigger element (optional)
 * @returns DeleteItemDialog component with confirmation dialog
 *
 * @example
 * ```tsx
 * <DeleteItemDialog
 *   item={item}
 *   onSuccess={(id) => console.log("Deleted:", id)}
 * />
 * ```
 */
export function DeleteItemDialog({
  item,
  onSuccess,
  trigger,
}: DeleteItemDialogProps) {
  const t = useTranslations("items.delete");
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Handles the delete action.
   * Calls the server action and manages loading/success/error states.
   */
  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const result = await deleteItemAction(item.id);

      if (result.success) {
        toast.success(result.message ?? t("success"));
        setOpen(false);
        onSuccess?.(item.id);
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
            {t("description", { name: item.name })}
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
