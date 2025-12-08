import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { Link } from "@/shared/infrastructure/i18n";
import { SigninForm } from "@/modules/auth/components/signin-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Props = {
  params: Promise<{ locale: string }>;
};

/**
 * Generates internationalized metadata for the signin page.
 * Uses getTranslations for server-side metadata generation.
 * @param params - Route parameters containing the locale
 * @returns Metadata object with translated title and description
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.signin" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

/**
 * Signin page server component.
 * Renders the SigninForm within a card layout with link to signup.
 * Requirements: 2.3 - Redirect to dashboard on successful signin
 */
export default async function SigninPage() {
  const t = await getTranslations("auth.signin");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <SigninForm />
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-muted-foreground text-sm">
          {t("noAccount")}{" "}
          <Link
            href="/signup"
            className="text-primary underline-offset-4 hover:underline"
          >
            {t("signupLink")}
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
