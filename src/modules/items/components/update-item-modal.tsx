"use client";

import {
  useEffect,
  useRef,
  useActionState,
  useState,
  useTransition,
} from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Pencil } from "lucide-react";
import { updateItemAction } from "../actions/update-item-action";
import {
  updateItemSchema,
  type UpdateItemInput,
  type Item,
} from "../types/schemas";
import { useSyncFormErrors } from "@/shared/hooks/use-sync-form-errors";
import { FormErrorAlert } from "@/components/form-error-alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

/**
 * Props for the UpdateItemModal component.
 */
interface UpdateItemModalProps {
  /** Item to update */
  item: Item;
  /** Callback when item is updated successfully, receives the updated item */
  onSuccess?: (item: Item) => void;
  /** Optional trigger element, defaults to icon button */
  trigger?: React.ReactNode;
}

/**
 * Modal dialog for updating an existing item.
 * Includes form validation and server action integration.
 *
 * @param props - Component props
 * @param props.item - Item to update
 * @param props.onSuccess - Optional callback when item is updated successfully
 * @param props.trigger - Optional custom trigger element
 * @returns UpdateItemModal component
 *
 * @example
 * ```tsx
 * <UpdateItemModal item={item} onSuccess={() => refetch()} />
 * ```
 */
export function UpdateItemModal({
  item,
  onSuccess,
  trigger,
}: UpdateItemModalProps) {
  const t = useTranslations("items");
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    updateItemAction.bind(null, item.id),
    {
      success: false,
      message: undefined,
      errors: undefined,
    }
  );
  const [, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const hasHandledSuccess = useRef(false);

  const form = useForm<UpdateItemInput>({
    resolver: zodResolver(updateItemSchema),
    defaultValues: {
      name: item.name,
      sku: item.sku ?? null,
      price: item.price,
      cost: item.cost,
      weight: item.weight,
      status: item.status === "archived" ? "inactive" : item.status,
      notes: item.notes ?? null,
      description: item.description ?? null,
      space_id: item.space_id ?? undefined,
    },
  });

  // Auto-focus first input when modal opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  // Sync server errors to form
  useSyncFormErrors(form, state.errors);

  // Close modal and reset form on success
  useEffect(() => {
    if (state.success && state.data && !hasHandledSuccess.current) {
      hasHandledSuccess.current = true;
      startTransition(() => {
        setOpen(false);
        onSuccess?.(state.data as Item);
      });
    }
  }, [state.success, state.data, onSuccess]);

  // Reset success handler when modal opens
  useEffect(() => {
    if (open) {
      hasHandledSuccess.current = false;
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="ghost" size="icon" className="size-8">
            <Pencil className="size-4" />
            <span className="sr-only">{t("actions.edit")}</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>{t("updateTitle")}</DialogTitle>
          <DialogDescription>{t("updateDescription")}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form action={formAction} className="grid gap-4">
            {!state.success && <FormErrorAlert message={state.message} />}

            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.name")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      ref={(e) => {
                        field.ref(e);
                        (
                          inputRef as React.MutableRefObject<HTMLInputElement | null>
                        ).current = e;
                      }}
                      placeholder={t("fields.namePlaceholder")}
                      disabled={isPending}
                      aria-label={t("fields.name")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* SKU */}
            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.sku")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      placeholder={t("fields.skuPlaceholder")}
                      disabled={isPending}
                      aria-label={t("fields.sku")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Price */}
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.price")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t("fields.pricePlaceholder")}
                      disabled={isPending}
                      aria-label={t("fields.price")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Cost */}
            <FormField
              control={form.control}
              name="cost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.cost")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t("fields.costPlaceholder")}
                      disabled={isPending}
                      aria-label={t("fields.cost")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Weight */}
            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.weight")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t("fields.weightPlaceholder")}
                      disabled={isPending}
                      aria-label={t("fields.weight")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("columns.status")}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger disabled={isPending}>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">
                        {t("status.active")}
                      </SelectItem>
                      <SelectItem value="inactive">
                        {t("status.inactive")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                  {/* Hidden input to ensure status is submitted with FormData */}
                  <input type="hidden" name={field.name} value={field.value} />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.description")}</FormLabel>
                  <FormControl>
                    <RichTextEditor
                      initialValue={field.value ?? undefined}
                      onChange={field.onChange}
                      placeholder={t("fields.descriptionPlaceholder")}
                      disabled={isPending}
                      ariaLabel={t("fields.description")}
                    />
                  </FormControl>
                  <FormMessage />
                  {/* Hidden input to submit description with FormData */}
                  <input
                    type="hidden"
                    name={field.name}
                    value={field.value ?? ""}
                  />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.notes")}</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value ?? ""}
                      placeholder={t("fields.notesPlaceholder")}
                      disabled={isPending}
                      aria-label={t("fields.notes")}
                      className="resize-none"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? t("updating") : t("update")}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
