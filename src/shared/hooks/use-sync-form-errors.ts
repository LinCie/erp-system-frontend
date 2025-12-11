"use client";

import { useEffect } from "react";
import {
  type UseFormReturn,
  type FieldValues,
  type Path,
} from "react-hook-form";

/**
 * Syncs server-side validation errors to react-hook-form state.
 * Automatically sets form errors when server action returns field errors.
 * @param form - The react-hook-form instance
 * @param errors - Server-side errors object from ActionResult
 * @example
 * ```typescript
 * const [state, formAction] = useActionState(action, initialState);
 * const form = useForm<FormInput>({ resolver: zodResolver(schema) });
 *
 * useSyncFormErrors(form, state.errors);
 * ```
 */
export function useSyncFormErrors<T extends FieldValues>(
  form: UseFormReturn<T>,
  errors: Record<string, string[]> | undefined
): void {
  useEffect(() => {
    if (errors) {
      Object.entries(errors).forEach(([field, messages]) => {
        if (messages && messages.length > 0) {
          form.setError(field as Path<T>, {
            type: "server",
            message: messages[0],
          });
        }
      });
    }
  }, [errors, form]);
}
