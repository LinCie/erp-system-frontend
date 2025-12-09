import { getTranslations } from "next-intl/server";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Dashboard page - main page for authenticated users.
 * Server component displaying welcome message within the dashboard layout.
 * Uses getTranslations for server-side internationalization.
 * @returns Dashboard page with translated welcome message
 */
export default async function DashboardPage() {
  const t = await getTranslations("dashboard");

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl">{t("title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm sm:text-base">
            {t("description")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
