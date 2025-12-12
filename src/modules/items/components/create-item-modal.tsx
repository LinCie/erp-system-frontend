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
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { createItemAction } from "../actions/create-item-action";
import {
  createItemSchema,
  type CreateItemInput,
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
 * Props for the CreateItemModal component.
 */
interface CreateItemModalProps {
  /** Space ID for the item */
  spaceId: number;
  /** Callback when item is created successfully, receives the created item */
  onSuccess?: (item: Item) => void;
}

/**
 * Modal dialog for creating a new item.
 * Includes form validation and server action integration.
 *
 * @param props - Component props
 * @param props.spaceId - Space ID for the item
 * @param props.onSuccess - Optional callback when item is created successfully
 * @returns CreateItemModal component
 *
 * @example
 * ```tsx
 * <CreateItemModal spaceId={123} onSuccess={() => refetch()} />
 * ```
 */
export function CreateItemModal({ spaceId, onSuccess }: CreateItemModalProps) {
  const t = useTranslations("items");
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(createItemAction, {
    success: false,
    message: undefined,
    errors: undefined,
  });
  const [, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const hasHandledSuccess = useRef(false);

  const form = useForm<CreateItemInput>({
    resolver: zodResolver(createItemSchema),
    defaultValues: {
      name: "",
      sku: null,
      price: "",
      cost: "",
      weight: "",
      status: "active",
      notes: null,
      description: null,
      space_id: spaceId,
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
      toast.success(state.message ?? t("createSuccess"));
      startTransition(() => {
        setOpen(false);
        form.reset();
        onSuccess?.(state.data as Item);
      });
    } else if (!state.success && state.message && !hasHandledSuccess.current) {
      toast.error(state.message ?? t("createError"));
    }
  }, [state.success, state.data, state.message, form, onSuccess, t]);

  // Reset success handler when modal opens
  useEffect(() => {
    if (open) {
      hasHandledSuccess.current = false;
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="shrink-0 gap-2">
          <Plus className="size-4" />
          <span className="hidden sm:inline">{t("create")}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>{t("createTitle")}</DialogTitle>
          <DialogDescription>{t("createDescription")}</DialogDescription>
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

            {/* Hidden field for space_id */}
            <input type="hidden" name="space_id" value={spaceId} />

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? t("creating") : t("create")}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
