"use client";

import { cn } from "@/shared/lib/utils";

/**
 * Props for the FormErrorAlert component.
 */
interface FormErrorAlertProps {
  /** Error message to display */
  message: string | undefined;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Displays a form-level error message with accessible alert role.
 * Only renders when message is provided.
 * @param props - Component props
 * @returns Error alert or null if no message
 * @example
 * ```tsx
 * <FormErrorAlert message={state.message} />
 * ```
 */
export function FormErrorAlert({ message, className }: FormErrorAlertProps) {
  if (!message) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        "bg-destructive/10 text-destructive rounded-md p-3 text-sm",
        className
      )}
    >
      {message}
    </div>
  );
}
