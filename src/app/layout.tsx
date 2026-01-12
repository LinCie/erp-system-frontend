import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const roboto = Roboto({ variable: "--font-roboto", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: "%s | Nerpai ERP",
    default: "Nerpai ERP",
  },
  description:
    "A complete, fast, and modern ERP that provides a lot of features like products and inventory management, HR, finance (accounts), transactions, and journals.",
  keywords: [
    "Nerpai ERP",
    "ERP",
    "Inventory Management",
    "Product Management",
    "HR",
    "Finance",
    "Accounting",
    "Journals",
    "Transactions",
  ],
  icons: {
    icon: "/favicon-32x32.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${roboto.className}`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
