import { cookies } from "next/headers";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/modules/dashboard/components/app-sidebar";
import { SiteHeader } from "@/modules/dashboard/components/site-header";

/**
 * Layout for the authenticated app routes.
 * This layout wraps all routes under the (app) group with the dashboard structure.
 * Provides SidebarProvider context to all child components.
 * @param children - Child components to render within the dashboard layout
 * @returns Dashboard layout with sidebar, header, and content area
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";

  // TODO: Replace with actual user data from auth context
  const user = {
    name: "Guest User",
    email: "guest@example.com",
    avatar: undefined,
  };

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar user={user} />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-2 md:p-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
