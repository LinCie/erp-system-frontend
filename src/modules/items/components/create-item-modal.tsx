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
import { RichTextEditor } from "@/components/rich-text-editor";
import { ItemImageUpload } from "./item-image-upload";
import { ItemFileUpload } from "./item-file-upload";
import { requestUploadUrlAction } from "../actions/request-upload-url-action";
import ky from "ky";

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
  const [images, setImages] = useState<File[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [state, formAction, isPending] = useActionState(
    createItemAction.bind(null, spaceId),
    {
      success: false,
      message: undefined,
      errors: undefined,
    }
  );
  const [, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const hasHandledSuccess = useRef(false);

  const form = useForm<CreateItemInput>({
    resolver: zodResolver(createItemSchema),
    defaultValues: {
      name: "",
      sku: undefined,
      code: undefined,
      price: "",
      price_discount: undefined,
      cost: "",
      weight: "",
      status: "active",
      notes: undefined,
      description: undefined,
      space_id: spaceId,
      images: undefined,
      files: undefined,
    },
  });

  // Key to reset image upload component
  const [imageUploadKey, setImageUploadKey] = useState(0);
  // Key to reset file upload component
  const [fileUploadKey, setFileUploadKey] = useState(0);

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
        setImageUploadKey((prev) => prev + 1);
        setFileUploadKey((prev) => prev + 1);
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

  // Reset image upload when modal closes
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setImageUploadKey((prev) => prev + 1);
      setFileUploadKey((prev) => prev + 1);
      setImages([]);
      setFiles([]);
    }
  };

  // Handle image file changes
  const handleImagesChange = (files: File[]) => {
    setImages(files);
  };

  // Handle file changes
  const handleFilesChange = (newFiles: File[]) => {
    setFiles(newFiles);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploadError(null);

    // Upload all images to R2 and collect their keys
    const uploadedImages = [];
    const uploadedFiles = [];
    setIsUploading(true);

    try {
      // Upload images
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

      // Upload files
      for (const file of files) {
        const response = await requestUploadUrlAction(file.type, file.size);
        if (!response.success) {
          setUploadError(
            response.message ?? "Failed to get upload URL for file"
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
            body: file,
          });
        } catch {
          setUploadError(`Failed to upload file: ${file.name}`);
          setIsUploading(false);
          return;
        }

        uploadedFiles.push({
          name: file.name,
          path: key,
          size: file.size,
        });
      }

      // Build FormData with all form fields
      const formData = new FormData();

      // Add all text fields from form state
      formData.set("name", form.getValues("name"));
      formData.set("cost", form.getValues("cost"));
      formData.set("price", form.getValues("price"));
      formData.set("weight", form.getValues("weight"));
      formData.set("status", form.getValues("status"));

      // Note: space_id is passed via action binding, not FormData

      // Add optional fields
      const sku = form.getValues("sku");
      if (sku) formData.set("sku", sku);

      const code = form.getValues("code");
      if (code) formData.set("code", code);

      const priceDiscount = form.getValues("price_discount");
      if (priceDiscount) formData.set("price_discount", priceDiscount);

      const description = form.getValues("description");
      if (description) formData.set("description", description);

      const notes = form.getValues("notes");
      if (notes) formData.set("notes", notes);

      // Add images array as JSON string
      if (uploadedImages.length > 0) {
        formData.set("images", JSON.stringify(uploadedImages));
      }

      // Add files array as JSON string
      if (uploadedFiles.length > 0) {
        formData.set("files", JSON.stringify(uploadedFiles));
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

            {/* Code */}
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.code")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      placeholder={t("fields.codePlaceholder")}
                      disabled={isPending}
                      aria-label={t("fields.code")}
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

            {/* Price Discount */}
            <FormField
              control={form.control}
              name="price_discount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.priceDiscount")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      placeholder={t("fields.priceDiscountPlaceholder")}
                      disabled={isPending}
                      aria-label={t("fields.priceDiscount")}
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
                      onChange={handleImagesChange}
                      disabled={isPending}
                      multiple
                      placeholder={t("fields.imagesPlaceholder")}
                      helperText={t("fields.imagesHelperText")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Files */}
            <FormField
              control={form.control}
              name="files"
              render={() => (
                <FormItem>
                  <FormLabel>{t("fields.files")}</FormLabel>
                  <FormControl>
                    <ItemFileUpload
                      key={fileUploadKey}
                      name="files"
                      onChange={handleFilesChange}
                      disabled={isPending}
                      multiple
                      placeholder={t("fields.filesPlaceholder")}
                      helperText={t("fields.filesHelperText")}
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
                  ? t("creating")
                  : t("create")}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
