import { useTranslations } from "next-intl";

import { Link } from "@/shared/infrastructure/i18n";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Localized 404 Not Found page component.
 * Displays a user-friendly error message when a page is not found.
 * Uses translations for internationalized content.
 * @returns Not found page with localized content
 */
export default function NotFoundPage() {
  const t = useTranslations("errors");

  return (
    <main className="bg-muted/40 flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-sm sm:max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl sm:text-2xl">{t("notFound")}</CardTitle>
          <CardDescription>{t("notFoundDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <Button asChild>
            <Link href="/">
              {t("backToHome", { defaultValue: "Back to Home" })}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
