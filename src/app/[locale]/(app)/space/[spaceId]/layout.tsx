import { getSpaceAction } from "@/modules/spaces/actions/get-space-action";
import { SpaceBreadcrumb } from "@/modules/spaces/components/space-breadcrumb";
import { SpaceProvider } from "@/modules/spaces/components/space-provider";

type Props = {
  params: Promise<{ spaceId: string }>;
  children: React.ReactNode;
};

/**
 * Layout for space routes with spaceId.
 * Fetches space data and provides it to child components via store.
 * Includes breadcrumb navigation.
 */
export default async function SpaceIdLayout({ params, children }: Props) {
  const { spaceId } = await params;

  // Fetch space data server-side
  const result = await getSpaceAction(Number(spaceId));
  const space = result.success && result.data ? result.data : null;

  return (
    <SpaceProvider initialSpace={space}>
      <SpaceBreadcrumb />
      {children}
    </SpaceProvider>
  );
}
