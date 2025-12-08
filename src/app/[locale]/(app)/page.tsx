import { getTranslations } from "next-intl/server";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SignoutButton } from "@/modules/auth/components/signout-button";

/**
 * Dashboard page - main page for authenticated users.
 * Server component displaying welcome message and signout functionality.
 * Uses getTranslations for server-side internationalization.
 * @returns Dashboard page with translated welcome message and signout button
 */
export default async function DashboardPage() {
  const t = await getTranslations("dashboard");

  return (
    <main className="bg-muted/40 flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-sm sm:max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl sm:text-2xl">{t("title")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <p className="text-muted-foreground text-center text-sm sm:text-base">
            {t("description")}
          </p>
          <SignoutButton />
        </CardContent>
      </Card>
    </main>
  );
}
