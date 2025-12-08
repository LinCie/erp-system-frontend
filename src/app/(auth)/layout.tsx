import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication",
  description: "Sign in or create an account",
};

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
