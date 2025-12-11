/**
 * Generates initials from a person's name.
 * Returns first letter of first and last name, or first two letters if single name.
 * @param name - The person's full name
 * @returns Two-character initials in uppercase, or "??" if name is empty
 * @example
 * ```typescript
 * getInitials("John Doe");     // "JD"
 * getInitials("Alice");        // "AL"
 * getInitials("");             // "??"
 * ```
 */
export function getInitials(name: string): string {
  if (!name) return "??";

  const parts = name.trim().split(" ");

  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
