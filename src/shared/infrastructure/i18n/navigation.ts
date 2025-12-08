import { createNavigation } from "next-intl/navigation";

import { routing } from "./routing";

/**
 * Locale-aware navigation utilities derived from routing configuration.
 * These APIs automatically handle locale prefixes in URLs.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
