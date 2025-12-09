# Implementation Plan

- [ ] 1. Set up spaces module structure and types
  - [ ] 1.1 Create Zod schemas for Space and query parameters
    - Create `src/modules/spaces/types/schemas.ts`
    - Define `spaceSchema`, `spaceListResponseSchema`, `getSpacesParamsSchema`
    - Export inferred TypeScript types
    - _Requirements: 1.1, 1.2_
  - [ ] 1.2 Create spaces service
    - Create `src/modules/spaces/services/spaces-service.ts`
    - Implement `getSpaces` method with search, limit, page parameters
    - Validate response with Zod schema
    - _Requirements: 1.1, 2.2, 3.2_

- [ ] 2. Create useDebounce hook
  - [ ] 2.1 Implement useDebounce hook
    - Create `src/shared/hooks/use-debounce.ts`
    - Accept generic value and delay parameters
    - Use useEffect with setTimeout for debouncing
    - Clean up timeout on unmount
    - _Requirements: 2.1_
  - [ ]* 2.2 Write property test for useDebounce hook
    - **Property 1: Debounce delays callback execution**
    - **Validates: Requirements 2.1**

- [ ] 3. Install required shadcn components
  - [ ] 3.1 Install table and select components
    - Run `bunx shadcn@latest add table select`
    - Verify components are added to `src/components/ui/`
    - _Requirements: 1.2, 3.1_

- [ ] 4. Implement SpaceList component
  - [ ] 4.1 Create SpaceList component with data table
    - Create `src/modules/spaces/components/space-list.tsx`
    - Use TanStack Table with columns: name, status, created_at, actions
    - Implement search input with useDebounce (300ms)
    - Implement limit selector with options 10, 20, 50
    - Add View action button linking to `/{locale}/{spaceId}`
    - Handle empty state and loading state
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 4.1, 4.2_
  - [ ]* 4.2 Write property test for table row rendering
    - **Property 5: Table rows contain required columns and actions**
    - **Validates: Requirements 1.2, 4.1**
  - [ ]* 4.3 Write property test for View action route generation
    - **Property 6: View action generates correct route**
    - **Validates: Requirements 4.2**

- [ ] 5. Integrate with dashboard page
  - [ ] 5.1 Update dashboard page to render SpaceList
    - Update `src/app/[locale]/(app)/page.tsx`
    - Fetch initial spaces server-side
    - Pass initial data and locale to SpaceList component
    - _Requirements: 1.1_

- [ ] 6. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ]* 7. Additional property tests
  - [ ]* 7.1 Write property test for search parameter
    - **Property 2: Search parameter passed to API**
    - **Validates: Requirements 2.2**
  - [ ]* 7.2 Write property test for limit parameter
    - **Property 3: Limit parameter passed to API**
    - **Validates: Requirements 3.2**
  - [ ]* 7.3 Write property test for page reset
    - **Property 4: Page resets when limit changes**
    - **Validates: Requirements 3.3**

- [ ] 8. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
