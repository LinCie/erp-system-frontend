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

import { createTradeAction } from "../actions/create-trade-action";
import {
  createTradeSchema,
  type CreateTradeInput,
  type Trade,
} from "../schemas";
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
import { Textarea } from "@/components/ui/textarea";

/**
 * Props for the CreateTradeModal component.
 */
interface CreateTradeModalProps {
  /** Space ID for the trade */
  spaceId: number;
  /** Callback when trade is created successfully, receives the created trade */
  onSuccess?: (trade: Trade) => void;
}

/**
 * Modal dialog for creating a new trade.
 * Includes form validation and server action integration.
 *
 * @param props - Component props
 * @param props.spaceId - Space ID for the trade
 * @param props.onSuccess - Optional callback when trade is created successfully
 * @returns CreateTradeModal component
 *
 * @example
 * ```tsx
 * <CreateTradeModal spaceId={123} onSuccess={(trade) => refetch()} />
 * ```
 */
export function CreateTradeModal({
  spaceId,
  onSuccess,
}: CreateTradeModalProps) {
  const t = useTranslations("trades");
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    createTradeAction.bind(null, spaceId),
    {
      success: false,
      message: undefined,
      errors: undefined,
    }
  );
  const [, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const hasHandledSuccess = useRef(false);

  const form = useForm<CreateTradeInput>({
    resolver: zodResolver(createTradeSchema),
    defaultValues: {
      space_id: spaceId,
      sender_id: null,
      sent_time: undefined,
      sender_notes: "",
      number: "",
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
        onSuccess?.(state.data as Trade);
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

  // Reset form when modal closes
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      form.reset();
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData();

    // Add form fields
    const number = form.getValues("number");
    if (number) formData.set("number", number);

    const senderNotes = form.getValues("sender_notes");
    if (senderNotes) formData.set("sender_notes", senderNotes);

    const sentTime = form.getValues("sent_time");
    if (sentTime) formData.set("sent_time", sentTime);

    const senderId = form.getValues("sender_id");
    if (senderId) formData.set("sender_id", String(senderId));

    startTransition(() => formAction(formData));
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="shrink-0 gap-2">
          <Plus className="size-4" />
          <span className="hidden sm:inline">{t("create")}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("createTitle")}</DialogTitle>
          <DialogDescription>{t("createDescription")}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="grid gap-4">
            {!state.success && <FormErrorAlert message={state.message} />}

            {/* Number */}
            <FormField
              control={form.control}
              name="number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.number")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      ref={(e) => {
                        field.ref(e);
                        (
                          inputRef as React.RefObject<HTMLInputElement | null>
                        ).current = e;
                      }}
                      value={field.value ?? ""}
                      placeholder={t("fields.numberPlaceholder")}
                      disabled={isPending}
                      aria-label={t("fields.number")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Sent Time */}
            <FormField
              control={form.control}
              name="sent_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.sentTime")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="datetime-local"
                      value={field.value ?? ""}
                      disabled={isPending}
                      aria-label={t("fields.sentTime")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Sender Notes */}
            <FormField
              control={form.control}
              name="sender_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.senderNotes")}</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value ?? ""}
                      placeholder={t("fields.senderNotesPlaceholder")}
                      disabled={isPending}
                      aria-label={t("fields.senderNotes")}
                      className="resize-none"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? t("creating") : t("create")}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
