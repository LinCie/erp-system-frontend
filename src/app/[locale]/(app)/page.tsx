import { SpaceList } from "@/modules/spaces/components/space-list";

/**
 * Dashboard page - main page for authenticated users.
 * Server component displaying welcome message and space list within the dashboard layout.
 * Fetches initial spaces server-side and passes them to the SpaceList component.
 * Uses getTranslations for server-side internationalization.
 * @returns Dashboard page with translated welcome message and space list
 */
export default async function DashboardPage() {
  return <SpaceList />;
}
