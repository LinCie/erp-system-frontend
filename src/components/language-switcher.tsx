"use client";

import { useLocale } from "next-intl";

import {
  Link,
  usePathname,
  routing,
  type Locale,
} from "@/shared/infrastructure/i18n";
import { cn } from "@/shared/lib/utils";

/**
 * Configuration for each supported locale with native names.
 */
const localeConfigs: Record<Locale, { name: string }> = {
  id: { name: "Bahasa Indonesia" },
  en: { name: "English" },
};

interface LanguageSwitcherProps {
  /** Additional CSS classes to apply to the container */
  className?: string;
}

/**
 * Language switcher component that displays all supported locales.
 * Allows users to switch between languages while preserving the current pathname.
 * @param props - Component props
 * @param props.className - Optional CSS classes for styling
 * @returns A language switcher component with locale links
 */
export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const currentLocale = useLocale();
  const pathname = usePathname();

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {routing.locales.map((locale) => {
        const isActive = locale === currentLocale;
        const config = localeConfigs[locale];

        return (
          <Link
            key={locale}
            href={pathname}
            locale={locale}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              "flex min-h-11 items-center justify-center",
              "hover:bg-accent hover:text-accent-foreground",
              "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
              isActive
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            {config.name}
          </Link>
        );
      })}
    </div>
  );
}
