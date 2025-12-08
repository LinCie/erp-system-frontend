import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

/**
 * Generates internationalized metadata for the auth layout.
 * Uses getTranslations for server-side metadata generation.
 * @param params - Route parameters containing the locale
 * @returns Metadata object with translated title and description
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.auth" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

/**
 * Auth layout component providing centered card layout for authentication forms.
 * Mobile-first responsive design with proper semantic structure.
 * @param children - The auth page content (signin/signup forms)
 */
export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="bg-muted/40 flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-sm sm:max-w-md">{children}</div>
    </main>
  );
}
