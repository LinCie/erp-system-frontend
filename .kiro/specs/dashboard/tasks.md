# Implementation Plan

- [x] 1. Install shadcn sidebar component and dependencies
  - Run `bunx shadcn@latest add sidebar` to install the sidebar component
  - Run `bunx shadcn@latest add breadcrumb separator dropdown-menu avatar collapsible tooltip` for additional required components
  - Verify all components are added to `src/components/ui/`
  - _Requirements: 1.1, 2.1_

- [x] 2. Create dashboard module structure and types
  - [x] 2.1 Create navigation type definitions
    - Create `src/modules/dashboard/types/navigation.ts` with NavItem, NavSubItem, and UserInfo interfaces
    - _Requirements: 2.3, 3.1_
  - [x] 2.2 Create navigation configuration
    - Create `src/modules/dashboard/constants/navigation-config.ts` with mainNavItems and secondaryNavItems
    - Include Dashboard, Users, Settings navigation items with appropriate icons
    - _Requirements: 2.3, 2.5_

- [x] 3. Implement sidebar components
  - [x] 3.1 Create NavMain component
    - Create `src/modules/dashboard/components/nav-main.tsx`
    - Implement collapsible menu items with icons and labels
    - Support nested sub-items using Collapsible component
    - Use Link from next-intl for navigation
    - _Requirements: 2.3, 2.5_
  - [ ]* 3.2 Write property test for NavMain
    - **Property 2: Navigation Items Render Completely**
    - **Validates: Requirements 2.3**
  - [x] 3.3 Create NavUser component
    - Create `src/modules/dashboard/components/nav-user.tsx`
    - Display user avatar, name, and email
    - Implement dropdown menu with account options
    - Integrate sign out action from auth module
    - _Requirements: 3.1, 3.2, 3.3_
  - [ ]* 3.4 Write property test for NavUser
    - **Property 4: User Info Display Completeness**
    - **Validates: Requirements 3.1**
  - [x] 3.5 Create AppSidebar component
    - Create `src/modules/dashboard/components/app-sidebar.tsx`
    - Compose SidebarHeader with app branding
    - Compose SidebarContent with NavMain
    - Compose SidebarFooter with NavUser
    - Apply correct height calculation for header offset
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 4. Implement header component
  - [x] 4.1 Create SiteHeader component
    - Create `src/modules/dashboard/components/site-header.tsx`
    - Implement sticky header with correct z-index
    - Add SidebarTrigger button for toggle functionality
    - Add Breadcrumb navigation (hidden on mobile)
    - Add Separator between toggle and breadcrumbs
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  - [ ]* 4.2 Write property test for sidebar toggle
    - **Property 1: Sidebar Toggle Round-Trip**
    - **Validates: Requirements 1.4**

- [x] 5. Update app layout with dashboard structure
  - [x] 5.1 Update AppLayout component
    - Modify `src/app/[locale]/(app)/layout.tsx` to include dashboard layout
    - Wrap children with SidebarProvider
    - Add SiteHeader component
    - Add AppSidebar component
    - Wrap page content with SidebarInset
    - _Requirements: 5.1, 5.2, 5.3_
  - [x] 5.2 Update dashboard page
    - Modify `src/app/[locale]/(app)/page.tsx` to work within new layout
    - Remove redundant layout styling from page
    - Keep card content for dashboard welcome message
    - _Requirements: 5.3_

- [x] 6. Add internationalization support
  - Update `src/shared/infrastructure/i18n/messages/en.json` with dashboard navigation labels
  - Update `src/shared/infrastructure/i18n/messages/id.json` with Indonesian translations
  - _Requirements: 2.3, 3.1_

- [ ] 7. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ]* 8. Write unit tests for dashboard components
  - [ ]* 8.1 Write unit tests for AppSidebar
    - Test rendering with various navigation configurations
    - Test user info display
    - _Requirements: 2.1, 2.2, 3.1_
  - [ ]* 8.2 Write unit tests for SiteHeader
    - Test sticky header rendering
    - Test breadcrumb visibility
    - _Requirements: 1.1, 1.2, 1.3_

- [ ] 9. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
