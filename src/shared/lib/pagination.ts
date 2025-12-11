/**
 * Generates an array of page numbers to display in pagination.
 * Shows first page, last page, current page, and surrounding pages with ellipsis.
 * @param currentPage - Current active page
 * @param totalPages - Total number of pages
 * @returns Array of page numbers and ellipsis markers
 * @example
 * ```typescript
 * getPageNumbers(5, 10);
 * // Returns: [1, "ellipsis", 4, 5, 6, "ellipsis", 10]
 * ```
 */
export function getPageNumbers(
  currentPage: number,
  totalPages: number
): (number | "ellipsis")[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | "ellipsis")[] = [];

  // Always show first page
  pages.push(1);

  if (currentPage > 3) {
    pages.push("ellipsis");
  }

  // Show pages around current
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (currentPage < totalPages - 2) {
    pages.push("ellipsis");
  }

  // Always show last page
  if (totalPages > 1) {
    pages.push(totalPages);
  }

  return pages;
}
