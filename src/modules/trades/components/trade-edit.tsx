"use client";

import {
  useEffect,
  useRef,
  useActionState,
  useState,
  useTransition,
  useCallback,
} from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { updateTradeAction } from "../actions/update-trade-action";
import {
  updateTradeSchema,
  type UpdateTradeInput,
  type Trade,
  type TradeFile,
  type TradeLink,
  type TradeDetailInput,
  TRADE_STATUSES,
} from "../schemas";
import { useSyncFormErrors } from "@/shared/hooks/use-sync-form-errors";
import { FormErrorAlert } from "@/components/form-error-alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ParentTradeInput } from "./parent-trade-input";
import { TradeContactInput } from "./trade-contact-input";
import { TradeFileUpload } from "./trade-file-upload";
import { TradeLinksInput } from "./trade-links-input";
import { TradeDetailsInput } from "./trade-details-input";

/**
 * Extended detail type for UI with selected item reference.
 */
interface DetailRow extends TradeDetailInput {
  _selectedItem?: {
    id: number;
    name: string;
    sku: string | null;
    cost: string;
    price: string;
  };
  _unitPrice?: number;
}

/**
 * Maps trade details from response format to input format.
 * Preserves the persisted id for existing details.
 */
function mapDetailsToInput(details?: Trade["details"]): DetailRow[] {
  if (!details || details.length === 0) return [];

  return details.map((detail) => {
    const unitPrice = detail.item ? parseFloat(detail.item.price) || 0 : 0;
    return {
      id: detail.id, // Preserve persisted ID
      item_id: detail.item?.id ?? null,
      model_type: detail.model_type,
      quantity: detail.quantity,
      price: detail.price,
      discount: detail.discount ?? 0,
      sku: detail.sku ?? detail.item?.sku ?? "",
      name: detail.name ?? detail.item?.name ?? "",
      notes: detail.notes ?? "",
      _unitPrice:
        unitPrice || (detail.quantity > 0 ? detail.price / detail.quantity : 0),
      _selectedItem: detail.item
        ? {
            id: detail.item.id,
            name: detail.item.name,
            sku: detail.item.sku,
            cost: detail.item.cost,
            price: detail.item.price,
          }
        : undefined,
    };
  });
}

/**
 * Props for the TradeEdit component.
 */
interface TradeEditProps {
  /** Trade ID to update */
  tradeId: number;
  /** Space ID for the trade */
  spaceId: number;
  /** Initial trade data to populate the form */
  initialData: Trade;
}

/**
 * TradeEdit component displays the trade edit form as a full page.
 * Includes form validation and server action integration.
 */
export function TradeEdit({ tradeId, spaceId, initialData }: TradeEditProps) {
  const t = useTranslations("trades");
  const tCommon = useTranslations("common");
  const router = useRouter();

  // Track initial details for diffing in server action
  const initialDetailsRef = useRef<TradeDetailInput[]>(
    mapDetailsToInput(initialData.details).map(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ({ _selectedItem, _unitPrice, ...rest }) => rest
    )
  );

  const [state, formAction, isPending] = useActionState(
    updateTradeAction.bind(null, tradeId, initialDetailsRef.current),
    {
      success: false,
      message: undefined,
      errors: undefined,
    }
  );
  const [, startTransition] = useTransition();
  const hasHandledSuccess = useRef(false);

  // Track files and links state separately for complex inputs
  const [existingFiles, setExistingFiles] = useState<TradeFile[]>(
    initialData.files ?? []
  );
  const [links, setLinks] = useState<TradeLink[]>(initialData.links ?? []);
  const [details, setDetails] = useState<DetailRow[]>(
    mapDetailsToInput(initialData.details)
  );

  const form = useForm<UpdateTradeInput>({
    resolver: zodResolver(updateTradeSchema),
    defaultValues: {
      handler_id: initialData.handler_id ?? null,
      sent_time: initialData.sent_time ?? undefined,
      received_time: initialData.received_time ?? undefined,
      receiver_id: initialData.receiver_id ?? undefined,
      receiver_notes: initialData.receiver_notes ?? "",
      handler_notes: initialData.handler_notes ?? "",
      description: initialData.description ?? "",
      status: initialData.status ?? "TX_DRAFT",
      parent_id: initialData.parent_id ?? undefined,
      tags: initialData.tags ?? [],
    },
  });

  // Sync server errors to form
  useSyncFormErrors(form, state.errors);

  // Redirect to trade view on success
  useEffect(() => {
    if (state.success && state.data && !hasHandledSuccess.current) {
      hasHandledSuccess.current = true;
      toast.success(state.message ?? t("updateSuccess"));
      startTransition(() => {
        router.push(`/space/${spaceId}/trades/${tradeId}`);
      });
    } else if (!state.success && state.message && !hasHandledSuccess.current) {
      toast.error(state.message ?? t("updateError"));
    }
  }, [state.success, state.data, state.message, tradeId, spaceId, router, t]);

  // Handle parent trade change
  const handleParentChange = useCallback(
    (value: number | null) => {
      form.setValue("parent_id", value ?? undefined);
    },
    [form]
  );

  // Handle contact change
  const handleContactChange = useCallback(
    (value: number | null) => {
      form.setValue("receiver_id", value ?? undefined);
    },
    [form]
  );

  // Handle files change - track for potential future file upload support
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleFilesChange = useCallback((_files: File[]) => {
    // New file uploads would need separate handling via multipart
    // For now, we only track existing files
  }, []);

  const handleExistingFilesChange = useCallback((files: TradeFile[]) => {
    setExistingFiles(files);
  }, []);

  // Handle links change
  const handleLinksChange = useCallback((newLinks: TradeLink[]) => {
    setLinks(newLinks);
  }, []);

  // Handle details change
  const handleDetailsChange = useCallback((newDetails: DetailRow[]) => {
    setDetails(newDetails);
  }, []);

  // Convert tags array to comma-separated string for display
  // eslint-disable-next-line react-hooks/incompatible-library -- React Compiler skips memoization for react-hook-form
  const tagsString = (form.watch("tags") ?? []).join(", ");

  const handleTagsChange = useCallback(
    (value: string) => {
      const tagsArray = value
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);
      form.setValue("tags", tagsArray);
    },
    [form]
  );

  /**
   * Handles form submission with type-safe FormData construction.
   * Uses form.handleSubmit() to leverage React Hook Form's validation.
   */
  const handleSubmit = (data: UpdateTradeInput) => {
    // Validate details
    for (const [index, detail] of details.entries()) {
      if (!detail.item_id) {
        toast.error(t("validation.itemRequired", { row: index + 1 }));
        return;
      }
      if (!detail.model_type) {
        toast.error(t("validation.typeRequired", { row: index + 1 }));
        return;
      }
    }

    const formData = new FormData();

    /**
     * Helper function to safely set FormData values based on type.
     * - Objects/arrays: JSON.stringify()
     * - Numbers: String()
     * - Strings: raw value
     * Skips undefined, null, and empty strings
     */
    const setValue = (key: string, value: unknown) => {
      if (value === undefined || value === null || value === "") return;

      if (typeof value === "object") {
        formData.set(key, JSON.stringify(value));
      } else {
        formData.set(key, String(value));
      }
    };

    // Set all form values with type-safe handling
    Object.entries(data).forEach(([key, value]) => setValue(key, value));

    // Add existing files as JSON (non-schema field)
    if (existingFiles.length > 0) {
      formData.set("files", JSON.stringify(existingFiles));
    }

    // Add links as JSON (filter out empty URLs) - non-schema field
    const validLinks = links.filter((link) => link.url.trim().length > 0);
    if (validLinks.length > 0) {
      formData.set("links", JSON.stringify(validLinks));
    }

    // Add details as JSON (filter out rows without item selected) - non-schema field
    // Strip UI-only fields before sending
    const validDetails = details
      .filter((detail) => detail.item_id !== null)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .map(({ _selectedItem, _unitPrice, ...rest }) => rest);
    if (validDetails.length > 0) {
      formData.set("details", JSON.stringify(validDetails));
    }

    startTransition(() => formAction(formData));
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{t("updateTitle")}</h1>
        <p className="text-muted-foreground mt-2">{t("updateDescription")}</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {!state.success && <FormErrorAlert message={state.message} />}

          {/* Row 1: Parent Trade, Contact */}
          <div className="grid gap-4 sm:grid-cols-2">
            <ParentTradeInput
              spaceId={spaceId}
              tradeId={tradeId}
              value={form.watch("parent_id") ?? null}
              onChange={handleParentChange}
              name="parent_id"
            />

            <TradeContactInput
              spaceId={spaceId}
              value={form.watch("receiver_id") ?? null}
              onChange={handleContactChange}
              name="receiver_id"
              receiver={initialData?.receiver}
            />
          </div>

          {/* Row 2: Transaction Date, Status */}
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="sent_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.transactionDate")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="datetime-local"
                      value={field.value ?? ""}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.status")}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? ""}
                    disabled={isPending}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={t("fields.statusPlaceholder")}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TRADE_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {t(`status.${status}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Row 3: Receiver Notes */}
          <FormField
            control={form.control}
            name="receiver_notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fields.receiverNotes")}</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    value={field.value ?? ""}
                    placeholder={t("fields.receiverNotesPlaceholder")}
                    disabled={isPending}
                    className="resize-none"
                    rows={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Row 4: Handler Notes */}
          <FormField
            control={form.control}
            name="handler_notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fields.handlerNotes")}</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    value={field.value ?? ""}
                    placeholder={t("fields.handlerNotesPlaceholder")}
                    disabled={isPending}
                    className="resize-none"
                    rows={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Row 5: File Upload */}
          <div className="space-y-2">
            <Label>{t("fields.files")}</Label>
            <TradeFileUpload
              name="files"
              existingFiles={existingFiles}
              onChange={handleFilesChange}
              onExistingFilesChange={handleExistingFilesChange}
              disabled={isPending}
              placeholder={t("fields.filesPlaceholder")}
              helperText={t("fields.filesHelperText")}
            />
          </div>

          {/* Row 6: Received Date, Tags */}
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="received_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.receivedDate")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="datetime-local"
                      value={field.value ?? ""}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <Label>{t("fields.tags")}</Label>
              <Input
                value={tagsString}
                onChange={(e) => handleTagsChange(e.target.value)}
                placeholder={t("fields.tagsPlaceholder")}
                disabled={isPending}
              />
            </div>
          </div>

          {/* Row 7: Links */}
          <TradeLinksInput
            value={links}
            onChange={handleLinksChange}
            disabled={isPending}
          />

          {/* Row 8: Trade Details */}
          <TradeDetailsInput
            value={details}
            onChange={handleDetailsChange}
            spaceId={spaceId}
            disabled={isPending}
          />

          {/* Submit Button */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/space/${spaceId}/trades/${tradeId}`)}
              disabled={isPending}
            >
              {tCommon("cancel")}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? t("updating") : tCommon("save")}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
