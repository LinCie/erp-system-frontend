import { type ZodError } from "zod";

/**
 * Maps Zod validation errors to a field-keyed error object.
 * Useful for displaying field-specific errors in forms.
 * @param zodError - The Zod error object from safeParse
 * @returns Record mapping field names to arrays of error messages
 * @example
 * ```typescript
 * const result = schema.safeParse(data);
 * if (!result.success) {
 *   const errors = mapZodErrors(result.error);
 *   // { email: ["Invalid email format"], password: ["Too short"] }
 * }
 * ```
 */
export function mapZodErrors(zodError: ZodError): Record<string, string[]> {
  const errors: Record<string, string[]> = {};

  for (const issue of zodError.issues) {
    const field = issue.path[0]?.toString() ?? "form";
    if (!errors[field]) {
      errors[field] = [];
    }
    errors[field].push(issue.message);
  }

  return errors;
}
