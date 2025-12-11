import { cookies } from "next/headers";
import { SpaceList } from "@/modules/spaces/components/space-list";
import { spacesService } from "@/modules/spaces/services/spaces-service";
import { type SpaceListResponse } from "@/modules/spaces/types/schemas";

type Props = {
  params: Promise<{ locale: string }>;
};

/** Default pagination metadata for initial state */
const DEFAULT_META = {
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  itemsPerPage: 10,
};

/**
 * Dashboard page - main page for authenticated users.
 * Server component displaying welcome message and space list within the dashboard layout.
 * Fetches initial spaces server-side and passes them to the SpaceList component.
 * Uses getTranslations for server-side internationalization.
 * @param params - Route parameters containing the locale
 * @returns Dashboard page with translated welcome message and space list
 */
export default async function DashboardPage({ params }: Props) {
  const { locale } = await params;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  // Fetch initial spaces server-side
  let initialData: SpaceListResponse = { data: [], metadata: DEFAULT_META };
  try {
    if (accessToken) {
      initialData = await spacesService.getSpaces(accessToken, { limit: 10 });
    }
  } catch {
    // If fetch fails, pass empty data - SpaceList will handle refetching
  }

  return <SpaceList initialData={initialData} locale={locale} />;
}
