import { defineRouting } from "next-intl/routing";

/**
 * Centralized routing configuration for internationalization.
 * Defines supported locales and default locale for the application.
 */
export const routing = defineRouting({
  /** List of all supported locales */
  locales: ["id", "en"],

  /** Default locale used when no locale is specified */
  defaultLocale: "id",

  /** Always include locale prefix in URLs (e.g., /id/signin, /en/signin) */
  localePrefix: "always",
});

/** Type representing supported locales */
export type Locale = (typeof routing.locales)[number];
