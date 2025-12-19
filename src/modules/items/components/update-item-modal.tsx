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
import { toast } from "sonner";
import ky from "ky";
import { updateItemAction } from "../actions/update-item-action";
import { requestUploadUrlAction } from "../actions/request-upload-url-action";
import {
  updateItemSchema,
  type UpdateItemInput,
  type Item,
  type ItemImage,
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
import { RichTextEditor } from "@/components/rich-text-editor";
import { ItemImageUpload } from "./item-image-upload";

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
  const [images, setImages] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
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
      sku: item.sku,
      price: item.price,
      cost: item.cost,
      weight: item.weight,
      status: item.status === "archived" ? "inactive" : item.status,
      notes: item.notes,
      description: item.description,
      space_id: item.space_id,
      images: undefined,
    },
  });

  // Track kept existing images for image upload
  const [keptExistingImages, setKeptExistingImages] = useState<ItemImage[]>(
    item.images ?? []
  );
  // Key to reset image upload component
  const [imageUploadKey, setImageUploadKey] = useState(0);

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
      toast.success(state.message ?? t("updateSuccess"));
      const updatedItem = state.data as Item;
      startTransition(() => {
        setOpen(false);
        setKeptExistingImages(updatedItem.images ?? []);
        setImageUploadKey((prev) => prev + 1);
        onSuccess?.(updatedItem);
      });
    } else if (!state.success && state.message && !hasHandledSuccess.current) {
      toast.error(state.message ?? t("updateError"));
    }
  }, [state.success, state.data, state.message, onSuccess, t]);

  // Reset success handler when modal opens
  useEffect(() => {
    if (open) {
      hasHandledSuccess.current = false;
    }
  }, [open]);

  // Reset image state when modal opens/closes
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      setKeptExistingImages(item.images ?? []);
      setImages([]);
      setImageUploadKey((prev) => prev + 1);
    }
  };

  // Handle new image file changes
  const handleImagesChange = (files: File[]) => {
    setImages(files);
  };

  // Handle existing images removal
  const handleExistingImagesChange = (images: ItemImage[]) => {
    setKeptExistingImages(images);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploadError(null);

    // Upload all new images to R2 and collect their keys
    const uploadedImages: {
      name: string;
      path: string;
      size: number;
      isNew: boolean;
    }[] = [];
    setIsUploading(true);

    try {
      for (const image of images) {
        const response = await requestUploadUrlAction(image.type, image.size);
        if (!response.success) {
          setUploadError(
            response.message ?? "Failed to get upload URL for image"
          );
          setIsUploading(false);
          return;
        }

        if (!response.data) {
          setUploadError("No upload URL received");
          setIsUploading(false);
          return;
        }

        const { url, key } = response.data;

        try {
          await ky.put(url, {
            body: image,
          });
        } catch {
          setUploadError(`Failed to upload image: ${image.name}`);
          setIsUploading(false);
          return;
        }

        uploadedImages.push({
          name: image.name,
          path: key,
          size: image.size,
          isNew: true,
        });
      }

      // Build FormData with all form fields
      const formData = new FormData();

      // Add all text fields from form state (with fallbacks for partial schema)
      const name = form.getValues("name");
      const cost = form.getValues("cost");
      const price = form.getValues("price");
      const weight = form.getValues("weight");
      const status = form.getValues("status");

      if (name) formData.set("name", name);
      if (cost) formData.set("cost", cost);
      if (price) formData.set("price", price);
      if (weight) formData.set("weight", weight);
      if (status) formData.set("status", status);
      formData.set("space_id", String(item.space_id));

      // Add optional fields
      const sku = form.getValues("sku");
      if (sku) formData.set("sku", sku);

      const description = form.getValues("description");
      if (description) formData.set("description", description);

      const notes = form.getValues("notes");
      if (notes) formData.set("notes", notes);

      // Combine kept existing images with newly uploaded images
      const allImages = [
        ...keptExistingImages.map((img) => ({
          name: img.name,
          path: img.path,
          size: img.size,
          isNew: img.isNew,
        })),
        ...uploadedImages,
      ];

      // Add images array as JSON string
      if (allImages.length > 0) {
        formData.set("images", JSON.stringify(allImages));
      }

      setIsUploading(false);
      startTransition(() => formAction(formData));
    } catch {
      setUploadError("An unexpected error occurred during upload");
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
          <form onSubmit={handleSubmit} className="grid gap-4">
            {!state.success && <FormErrorAlert message={state.message} />}
            {uploadError && <FormErrorAlert message={uploadError} />}

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
                          inputRef as React.RefObject<HTMLInputElement | null>
                        ).current = e;
                      }}
                      placeholder={t("fields.namePlaceholder")}
                      disabled={isPending || isUploading}
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
                      disabled={isPending || isUploading}
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
                      disabled={isPending || isUploading}
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
                      disabled={isPending || isUploading}
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
                      disabled={isPending || isUploading}
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
                      <SelectTrigger disabled={isPending || isUploading}>
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
                      disabled={isPending || isUploading}
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
                      disabled={isPending || isUploading}
                      aria-label={t("fields.notes")}
                      className="resize-none"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Images */}
            <FormField
              control={form.control}
              name="images"
              render={() => (
                <FormItem>
                  <FormLabel>{t("fields.images")}</FormLabel>
                  <FormControl>
                    <ItemImageUpload
                      key={imageUploadKey}
                      name="images"
                      existingImages={keptExistingImages}
                      onChange={handleImagesChange}
                      onExistingImagesChange={handleExistingImagesChange}
                      disabled={isPending || isUploading}
                      multiple
                      placeholder={t("fields.imagesPlaceholder")}
                      helperText={t("fields.imagesHelperText")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={isPending || isUploading}
            >
              {isUploading
                ? t("uploading")
                : isPending
                  ? t("updating")
                  : t("update")}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
