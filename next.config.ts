import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

/**
 * Extract hostname from URL string safely.
 * Returns undefined if URL is invalid or missing.
 */
function getHostname(url: string | undefined): string | undefined {
  if (!url) return undefined;
  try {
    return new URL(url).hostname;
  } catch {
    return undefined;
  }
}

// Get hostnames for image optimization
const oldErpHostname = getHostname(process.env.NEXT_PUBLIC_OLD_ERP_URL);
const newErpHostname = getHostname(process.env.NEXT_PUBLIC_NEW_ERP_URL);

// Build remote patterns for next/image
const remotePatterns: NextConfig["images"] = {
  remotePatterns: [
    ...(oldErpHostname
      ? [{ protocol: "https" as const, hostname: oldErpHostname }]
      : []),
    ...(newErpHostname
      ? [{ protocol: "https" as const, hostname: newErpHostname }]
      : []),
  ],
};

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: remotePatterns,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.BACKEND_URL}/:path*`,
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin(
  "./src/shared/infrastructure/i18n/request.ts"
);

export default withNextIntl(nextConfig);
