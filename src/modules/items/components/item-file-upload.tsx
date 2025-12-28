"use client";

import { useCallback, useState, useRef, useEffect } from "react";
import { FileUp, Trash2, X, AlertCircle, FileIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/shared/lib/utils";
import { getItemImageUrl } from "@/shared/lib/image-url";
import { type ItemFile } from "../schemas";

/** Maximum total file size in bytes (100MB) */
const MAX_TOTAL_SIZE_BYTES = 100 * 1024 * 1024;

/** Maximum single file size in bytes (50MB) */
const MAX_SINGLE_FILE_SIZE_BYTES = 50 * 1024 * 1024;

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
 * Preview item for displaying files (both File objects and existing ItemFile)
 */
interface PreviewItem {
  id: string;
  url: string;
  name: string;
  size: number;
  isExisting: boolean;
  file?: File;
  existingFile?: ItemFile;
}

interface ItemFileUploadProps {
  /** Field name for form submission */
  name: string;
  /** Existing files from the item (for update mode) */
  existingFiles?: ItemFile[];
  /** Callback when files change */
  onChange?: (files: File[]) => void;
  /** Callback when existing files are removed */
  onExistingFilesChange?: (files: ItemFile[]) => void;
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
 * File upload component for items with support for:
 * - Single or multiple file selection
 * - Drag and drop
 * - Existing file display (for update mode)
 * - Remove functionality
 *
 * @param props - Component props
 */
export function ItemFileUpload({
  name,
  existingFiles = [],
  onChange,
  onExistingFilesChange,
  disabled = false,
  multiple = true,
  className,
  placeholder = "Click to select",
  helperText = "or drag and drop files here",
}: ItemFileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [keptExistingFiles, setKeptExistingFiles] =
    useState<ItemFile[]>(existingFiles);
  const [sizeError, setSizeError] = useState<string | null>(null);

  // Calculate total size of new files
  const totalNewFilesSize = newFiles.reduce((sum, file) => sum + file.size, 0);
  const isOverLimit = totalNewFilesSize > MAX_TOTAL_SIZE_BYTES;

  // Sync existing files when prop changes
  useEffect(() => {
    setKeptExistingFiles(existingFiles);
  }, [existingFiles]);

  // Generate preview items for display
  const previewItems: PreviewItem[] = [
    // Existing files
    ...keptExistingFiles.map((file) => ({
      id: `existing-${file.path}`,
      url: getItemImageUrl(file.path, true),
      name: file.name,
      size: file.size,
      isExisting: true,
      existingFile: file,
    })),
    // New files
    ...newFiles.map((file) => ({
      id: `new-${file.name}-${file.lastModified}`,
      url: "",
      name: file.name,
      size: file.size,
      isExisting: false,
      file,
    })),
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

      // Check individual file sizes
      const oversizedFile = fileArray.find(
        (f) => f.size > MAX_SINGLE_FILE_SIZE_BYTES
      );
      if (oversizedFile) {
        setSizeError(
          `File "${oversizedFile.name}" (${formatFileSize(oversizedFile.size)}) exceeds 50MB limit per file.`
        );
        return;
      }

      const updatedFiles = multiple ? [...newFiles, ...fileArray] : fileArray;

      // Check total size
      const totalSize = updatedFiles.reduce((sum, file) => sum + file.size, 0);
      if (totalSize > MAX_TOTAL_SIZE_BYTES) {
        setSizeError(
          `Total size (${formatFileSize(totalSize)}) exceeds 100MB limit. Please remove some files.`
        );
      } else {
        setSizeError(null);
      }

      setNewFiles(updatedFiles);
      onChange?.(updatedFiles);

      if (totalSize <= MAX_TOTAL_SIZE_BYTES) {
        syncFilesToInput(updatedFiles);
      } else {
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

      const fileArray = Array.from(files);

      // Check individual file sizes
      const oversizedFile = fileArray.find(
        (f) => f.size > MAX_SINGLE_FILE_SIZE_BYTES
      );
      if (oversizedFile) {
        setSizeError(
          `File "${oversizedFile.name}" (${formatFileSize(oversizedFile.size)}) exceeds 50MB limit per file.`
        );
        return;
      }

      const filesToAdd = multiple ? fileArray : [fileArray[0]];
      const updatedFiles = multiple ? [...newFiles, ...filesToAdd] : filesToAdd;

      // Check total size
      const totalSize = updatedFiles.reduce((sum, file) => sum + file.size, 0);
      if (totalSize > MAX_TOTAL_SIZE_BYTES) {
        setSizeError(
          `Total size (${formatFileSize(totalSize)}) exceeds 100MB limit. Please remove some files.`
        );
      } else {
        setSizeError(null);
      }

      setNewFiles(updatedFiles);
      onChange?.(updatedFiles);

      if (totalSize <= MAX_TOTAL_SIZE_BYTES) {
        syncFilesToInput(updatedFiles);
      } else {
        syncFilesToInput([]);
      }
    },
    [disabled, multiple, newFiles, onChange, syncFilesToInput]
  );

  const handleRemoveNew = useCallback(
    (fileToRemove: File) => {
      const updatedFiles = newFiles.filter((f) => f !== fileToRemove);

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
    (fileToRemove: ItemFile) => {
      const updatedFiles = keptExistingFiles.filter(
        (f) => f.path !== fileToRemove.path
      );
      setKeptExistingFiles(updatedFiles);
      onExistingFilesChange?.(updatedFiles);
    },
    [keptExistingFiles, onExistingFilesChange]
  );

  const handleRemoveAll = useCallback(() => {
    setNewFiles([]);
    setKeptExistingFiles([]);
    setSizeError(null);
    onChange?.([]);
    onExistingFilesChange?.([]);
    syncFilesToInput([]);
  }, [onChange, onExistingFilesChange, syncFilesToInput]);

  const hasFiles = previewItems.length > 0;

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Hidden file input for form submission */}
      <Input
        type="file"
        name={name}
        multiple={multiple}
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
        disabled={disabled}
      />

      {!hasFiles ? (
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
            <FileUp className="text-muted-foreground size-6" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">{placeholder}</p>
            <p className="text-muted-foreground text-xs">{helperText}</p>
          </div>
        </div>
      ) : (
        /* File list */
        <div className="space-y-3">
          <div className="space-y-2">
            {previewItems.map((item) => (
              <div
                key={item.id}
                className="bg-muted/50 flex items-center justify-between gap-3 rounded-lg border p-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="bg-background rounded-md p-2">
                    <FileIcon className="text-muted-foreground size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {formatFileSize(item.size)}
                      {item.isExisting && (
                        <span className="text-secondary-foreground bg-secondary ml-2 rounded px-1.5 py-0.5 text-[10px]">
                          Existing
                        </span>
                      )}
                      {!item.isExisting && (
                        <span className="text-primary-foreground bg-primary ml-2 rounded px-1.5 py-0.5 text-[10px]">
                          New
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                {!disabled && (
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="text-destructive hover:bg-destructive hover:text-destructive-foreground size-8 shrink-0"
                    onClick={() =>
                      item.isExisting
                        ? handleRemoveExisting(item.existingFile!)
                        : handleRemoveNew(item.file!)
                    }
                  >
                    <X className="size-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Add more button */}
          <div
            onClick={handleThumbnailClick}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "border-muted-foreground/25 bg-muted/50 hover:bg-muted flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed p-3 transition-colors",
              isDragging && "border-primary/50 bg-primary/5",
              disabled && "cursor-not-allowed opacity-50"
            )}
          >
            <FileUp className="text-muted-foreground size-4" />
            <span className="text-muted-foreground text-sm">
              Add more files
            </span>
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

      {/* File count and size indicator */}
      {hasFiles && (
        <div className="text-center">
          <p className="text-muted-foreground text-xs">
            {previewItems.length} file{previewItems.length !== 1 ? "s" : ""}{" "}
            selected
            {keptExistingFiles.length > 0 &&
              ` (${keptExistingFiles.length} existing, ${newFiles.length} new)`}
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
              New files: {formatFileSize(totalNewFilesSize)} / 100MB
            </p>
          )}
        </div>
      )}

      {/* Max size hint in empty state */}
      {!hasFiles && (
        <p className="text-muted-foreground text-center text-xs">
          Max 50MB per file, 100MB total
        </p>
      )}
    </div>
  );
}
