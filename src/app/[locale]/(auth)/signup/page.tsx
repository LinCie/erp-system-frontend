import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { Link } from "@/shared/infrastructure/i18n";
import { SignupForm } from "@/modules/auth/components/signup-form";
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
 * Generates internationalized metadata for the signup page.
 * Uses getTranslations for server-side metadata generation.
 * @param params - Route parameters containing the locale
 * @returns Metadata object with translated title and description
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.signup" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

/**
 * Signup page server component.
 * Renders the SignupForm within a card layout with link to signin.
 * Requirements: 1.6 - Redirect to dashboard on successful signup
 */
export default async function SignupPage() {
  const t = await getTranslations("auth.signup");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <SignupForm />
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-muted-foreground text-sm">
          {t("hasAccount")}{" "}
          <Link
            href="/signin"
            className="text-primary underline-offset-4 hover:underline"
          >
            {t("signinLink")}
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
