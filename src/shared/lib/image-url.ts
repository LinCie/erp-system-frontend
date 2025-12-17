/**
 * Resolves an item image path to a full URL based on the isNew flag.
 *
 * URL selection rules:
 * - If path is already absolute (starts with "http"), return as-is
 * - If isNew === true → use NEW ERP base URL
 * - If isNew === false OR undefined → use OLD ERP base URL (default)
 *
 * @param path - The relative image path (e.g., "/image/name.webp")
 * @param isNew - Optional flag indicating if image is from new ERP system
 * @returns Full URL to the image, or empty string if path is invalid
 *
 * @example
 * ```typescript
 * // Old ERP image (default)
 * getItemImageUrl("/image/photo.webp"); // "https://het.nerpai.space/image/photo.webp"
 *
 * // New ERP image
 * getItemImageUrl("/image/photo.webp", true); // "https://r2.example.com/image/photo.webp"
 *
 * // Absolute URL passthrough
 * getItemImageUrl("https://cdn.example.com/photo.webp"); // "https://cdn.example.com/photo.webp"
 * ```
 */
export function getItemImageUrl(path: string, isNew?: boolean): string {
  // Handle empty or invalid path
  if (!path || typeof path !== "string") {
    return "";
  }

  // Absolute URL passthrough
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // Select base URL based on isNew flag (default to OLD when undefined)
  const baseUrl = isNew
    ? process.env.NEXT_PUBLIC_NEW_ERP_URL
    : process.env.NEXT_PUBLIC_OLD_ERP_URL;

  // Fail gracefully if env is missing
  if (!baseUrl) {
    console.warn(
      `Missing environment variable: ${isNew ? "NEXT_PUBLIC_NEW_ERP_URL" : "NEXT_PUBLIC_OLD_ERP_URL"}`
    );
    return path; // Return path as fallback
  }

  // Safe slash join: remove trailing slash from base, ensure leading slash on path
  const normalizedBase = baseUrl.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${normalizedBase}${normalizedPath}`;
}
