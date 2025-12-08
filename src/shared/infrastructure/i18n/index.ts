/**
 * i18n infrastructure exports.
 * Provides routing configuration and navigation utilities for internationalization.
 */
export { routing, type Locale } from "./routing";
export {
  Link,
  redirect,
  usePathname,
  useRouter,
  getPathname,
} from "./navigation";
