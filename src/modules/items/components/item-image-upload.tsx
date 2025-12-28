"use client";

import { useCallback, useState, useRef, useEffect } from "react";
import { ImagePlus, Trash2, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/shared/lib/utils";
import { getItemImageUrl } from "@/shared/lib/image-url";
import { type ItemImage } from "../schemas";

/** Maximum total file size in bytes (5MB) */
const MAX_TOTAL_SIZE_BYTES = 5 * 1024 * 1024;

/**
 * Formats bytes to human-readable string
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Preview item for displaying images (both File objects and existing ItemImage)
 */
interface PreviewItem {
  id: string;
  url: string;
  name: string;
  isExisting: boolean;
  file?: File;
  existingImage?: ItemImage;
}

interface ItemImageUploadProps {
  /** Field name for form submission */
  name: string;
  /** Existing images from the item (for update mode) */
  existingImages?: ItemImage[];
  /** Callback when files change */
  onChange?: (files: File[]) => void;
  /** Callback when existing images are removed */
  onExistingImagesChange?: (images: ItemImage[]) => void;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Whether to allow multiple file selection */
  multiple?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Helper text */
  helperText?: string;
}

/**
 * Image upload component for items with support for:
 * - Single or multiple file selection
 * - Drag and drop
 * - Preview carousel for multiple images
 * - Existing image display (for update mode)
 * - Remove functionality
 *
 * @param props - Component props
 */
export function ItemImageUpload({
  name,
  existingImages = [],
  onChange,
  onExistingImagesChange,
  disabled = false,
  multiple = true,
  className,
  placeholder = "Click to select",
  helperText = "or drag and drop files here",
}: ItemImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [keptExistingImages, setKeptExistingImages] =
    useState<ItemImage[]>(existingImages);
  const previewUrlsRef = useRef<Map<string, string>>(new Map());
  const [sizeError, setSizeError] = useState<string | null>(null);

  // Calculate total size of new files
  const totalNewFilesSize = newFiles.reduce((sum, file) => sum + file.size, 0);
  const isOverLimit = totalNewFilesSize > MAX_TOTAL_SIZE_BYTES;

  // Sync existing images when prop changes
  useEffect(() => {
    setKeptExistingImages(existingImages);
  }, [existingImages]);

  // Cleanup preview URLs on unmount
  useEffect(() => {
    const urlsRef = previewUrlsRef.current;
    return () => {
      urlsRef.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  // State for preview URLs of new files
  const [newFilePreviewUrls, setNewFilePreviewUrls] = useState<
    Map<string, string>
  >(new Map());

  // Update preview URLs when newFiles change
  useEffect(() => {
    const newUrls = new Map<string, string>();
    const urlsToRevoke: string[] = [];

    newFiles.forEach((file) => {
      const id = `new-${file.name}-${file.lastModified}`;
      const existingUrl = previewUrlsRef.current.get(id);
      if (existingUrl) {
        newUrls.set(id, existingUrl);
      } else {
        const url = URL.createObjectURL(file);
        newUrls.set(id, url);
        previewUrlsRef.current.set(id, url);
      }
    });

    // Find URLs to revoke (files that were removed)
    previewUrlsRef.current.forEach((url, id) => {
      if (!newUrls.has(id)) {
        urlsToRevoke.push(url);
      }
    });

    // Revoke old URLs
    urlsToRevoke.forEach((url) => URL.revokeObjectURL(url));

    // Update ref and state
    previewUrlsRef.current = newUrls;
    setNewFilePreviewUrls(newUrls);
  }, [newFiles]);

  // Generate preview items for display
  const previewItems: PreviewItem[] = [
    // Existing images
    ...keptExistingImages.map((img) => ({
      id: `existing-${img.path}`,
      url: getItemImageUrl(img.path, img.isNew),
      name: img.name,
      isExisting: true,
      existingImage: img,
    })),
    // New files
    ...newFiles.map((file) => {
      const id = `new-${file.name}-${file.lastModified}`;
      return {
        id,
        url: newFilePreviewUrls.get(id) ?? "",
        name: file.name,
        isExisting: false,
        file,
      };
    }),
  ];

  const handleThumbnailClick = useCallback(() => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  }, [disabled]);

  // Sync files to the hidden input using DataTransfer
  const syncFilesToInput = useCallback((files: File[]) => {
    if (!fileInputRef.current) return;

    const dataTransfer = new DataTransfer();
    files.forEach((file) => dataTransfer.items.add(file));
    fileInputRef.current.files = dataTransfer.files;
  }, []);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      const fileArray = Array.from(files);
      const updatedFiles = multiple ? [...newFiles, ...fileArray] : fileArray;

      // Check total size
      const totalSize = updatedFiles.reduce((sum, file) => sum + file.size, 0);
      if (totalSize > MAX_TOTAL_SIZE_BYTES) {
        setSizeError(
          `Total size (${formatFileSize(totalSize)}) exceeds 5MB limit. Please remove some images.`
        );
      } else {
        setSizeError(null);
      }

      setNewFiles(updatedFiles);
      onChange?.(updatedFiles);

      // Sync all files back to the input for form submission (only if under limit)
      if (totalSize <= MAX_TOTAL_SIZE_BYTES) {
        syncFilesToInput(updatedFiles);
      } else {
        // Clear the input if over limit to prevent form submission
        syncFilesToInput([]);
      }
    },
    [multiple, newFiles, onChange, syncFilesToInput]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      const files = e.dataTransfer.files;
      if (!files || files.length === 0) return;

      const imageFiles = Array.from(files).filter((file) =>
        file.type.startsWith("image/")
      );

      if (imageFiles.length === 0) return;

      const filesToAdd = multiple ? imageFiles : [imageFiles[0]];
      const updatedFiles = multiple ? [...newFiles, ...filesToAdd] : filesToAdd;

      // Check total size
      const totalSize = updatedFiles.reduce((sum, file) => sum + file.size, 0);
      if (totalSize > MAX_TOTAL_SIZE_BYTES) {
        setSizeError(
          `Total size (${formatFileSize(totalSize)}) exceeds 5MB limit. Please remove some images.`
        );
      } else {
        setSizeError(null);
      }

      setNewFiles(updatedFiles);
      onChange?.(updatedFiles);

      // Sync all files to the input for form submission (only if under limit)
      if (totalSize <= MAX_TOTAL_SIZE_BYTES) {
        syncFilesToInput(updatedFiles);
      } else {
        // Clear the input if over limit to prevent form submission
        syncFilesToInput([]);
      }
    },
    [disabled, multiple, newFiles, onChange, syncFilesToInput]
  );

  const handleRemoveNew = useCallback(
    (fileToRemove: File) => {
      const id = `new-${fileToRemove.name}-${fileToRemove.lastModified}`;
      const url = previewUrlsRef.current.get(id);
      if (url) {
        URL.revokeObjectURL(url);
        previewUrlsRef.current.delete(id);
      }

      const updatedFiles = newFiles.filter((f) => f !== fileToRemove);

      // Check if now under limit
      const totalSize = updatedFiles.reduce((sum, file) => sum + file.size, 0);
      if (totalSize <= MAX_TOTAL_SIZE_BYTES) {
        setSizeError(null);
        syncFilesToInput(updatedFiles);
      }

      setNewFiles(updatedFiles);
      onChange?.(updatedFiles);
    },
    [newFiles, onChange, syncFilesToInput]
  );

  const handleRemoveExisting = useCallback(
    (imageToRemove: ItemImage) => {
      const updatedImages = keptExistingImages.filter(
        (img) => img.path !== imageToRemove.path
      );
      setKeptExistingImages(updatedImages);
      onExistingImagesChange?.(updatedImages);
    },
    [keptExistingImages, onExistingImagesChange]
  );

  const handleRemoveAll = useCallback(() => {
    // Cleanup all preview URLs
    previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    previewUrlsRef.current.clear();

    setNewFiles([]);
    setKeptExistingImages([]);
    setSizeError(null);
    onChange?.([]);
    onExistingImagesChange?.([]);

    // Clear the file input
    syncFilesToInput([]);
  }, [onChange, onExistingImagesChange, syncFilesToInput]);

  const hasImages = previewItems.length > 0;

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Hidden file input for form submission */}
      <Input
        type="file"
        name={name}
        accept="image/*"
        multiple={multiple}
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
        disabled={disabled}
      />

      {!hasImages ? (
        /* Empty state - drop zone */
        <div
          onClick={handleThumbnailClick}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "border-muted-foreground/25 bg-muted/50 hover:bg-muted flex h-48 cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed transition-colors",
            isDragging && "border-primary/50 bg-primary/5",
            disabled && "cursor-not-allowed opacity-50"
          )}
        >
          <div className="bg-background rounded-full p-3 shadow-sm">
            <ImagePlus className="text-muted-foreground size-6" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">{placeholder}</p>
            <p className="text-muted-foreground text-xs">{helperText}</p>
          </div>
        </div>
      ) : (
        /* Preview grid */
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {previewItems.map((item) => (
              <div key={item.id} className="group relative">
                <div className="relative aspect-square overflow-hidden rounded-lg border">
                  {item.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.url}
                      alt={item.name}
                      className="size-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="bg-muted flex size-full items-center justify-center">
                      <ImagePlus className="text-muted-foreground size-8" />
                    </div>
                  )}
                  {/* Remove button overlay */}
                  {!disabled && (
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      className="absolute top-1 right-1 size-6 opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={() =>
                        item.isExisting
                          ? handleRemoveExisting(item.existingImage!)
                          : handleRemoveNew(item.file!)
                      }
                    >
                      <X className="size-3" />
                    </Button>
                  )}
                  {/* Badge for existing vs new */}
                  <span
                    className={cn(
                      "absolute bottom-1 left-1 rounded px-1.5 py-0.5 text-[10px] font-medium",
                      item.isExisting
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-primary text-primary-foreground"
                    )}
                  >
                    {item.isExisting ? "Existing" : "New"}
                  </span>
                </div>
                <p className="text-muted-foreground mt-1 truncate text-center text-[10px]">
                  {item.name}
                </p>
              </div>
            ))}

            {/* Add more button as grid item */}
            <div
              onClick={handleThumbnailClick}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                "border-muted-foreground/25 bg-muted/50 hover:bg-muted flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed transition-colors",
                isDragging && "border-primary/50 bg-primary/5",
                disabled && "cursor-not-allowed opacity-50"
              )}
            >
              <ImagePlus className="text-muted-foreground size-5" />
              <span className="text-muted-foreground text-[10px]">Add</span>
            </div>
          </div>

          {/* Remove all button */}
          <div className="flex justify-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemoveAll}
              disabled={disabled}
              className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <Trash2 className="mr-2 size-4" />
              Remove All
            </Button>
          </div>
        </div>
      )}

      {/* Size error message */}
      {sizeError && (
        <div className="bg-destructive/10 text-destructive flex items-center justify-center gap-2 rounded-md px-3 py-2">
          <AlertCircle className="size-4 shrink-0" />
          <p className="text-xs font-medium">{sizeError}</p>
        </div>
      )}

      {/* Image count and size indicator */}
      {hasImages && (
        <div className="text-center">
          <p className="text-muted-foreground text-xs">
            {previewItems.length} image{previewItems.length !== 1 ? "s" : ""}{" "}
            selected
            {keptExistingImages.length > 0 &&
              ` (${keptExistingImages.length} existing, ${newFiles.length} new)`}
          </p>
          {newFiles.length > 0 && (
            <p
              className={cn(
                "text-xs",
                isOverLimit
                  ? "text-destructive font-medium"
                  : "text-muted-foreground"
              )}
            >
              New files: {formatFileSize(totalNewFilesSize)} / 5MB
            </p>
          )}
        </div>
      )}

      {/* Max size hint in empty state */}
      {!hasImages && (
        <p className="text-muted-foreground text-center text-xs">
          Maximum total upload size: 5MB
        </p>
      )}
    </div>
  );
}
