# Design Document: Space List

## Overview

The Space List feature provides a data table view of spaces on the main dashboard page. Users can view spaces with their name, status, and creation date, search for spaces with debounced input, control pagination limits, and navigate to individual space detail pages.

## Architecture

The feature follows the existing module-based architecture:

```
src/modules/spaces/
├── components/
│   └── space-list.tsx          # Client component with data table
├── services/
│   └── spaces-service.ts       # API service for space operations
└── types/
    └── schemas.ts              # Zod schemas and TypeScript types

src/shared/hooks/
└── use-debounce.ts             # Reusable debounce hook

src/app/[locale]/(app)/
└── page.tsx                    # Dashboard page (Server Component)
```

```mermaid
flowchart TD
    A[Dashboard Page] --> B[SpaceList Component]
    B --> C[useDebounce Hook]
    B --> D[TanStack Table]
    B --> E[spacesService]
    E --> F[HTTP Client]
    F --> G[/spaces API]
    
    subgraph UI Components
        D --> H[Table]
        D --> I[Input - Search]
        D --> J[Select - Limit]
        D --> K[Actions Column]
    end
```

## Components and Interfaces

### SpaceList Component

Client component that renders the data table with search and limit controls.

```typescript
interface SpaceListProps {
  initialSpaces: Space[];
  locale: string;
}
```

**Responsibilities:**
- Render data table with TanStack Table
- Handle search input with debounce
- Handle limit selection
- Fetch spaces when search/limit changes
- Render View action for each row

### useDebounce Hook

Custom hook for debouncing values.

```typescript
function useDebounce<T>(value: T, delay: number): T
```

**Behavior:**
- Returns debounced value after specified delay (300ms for search)
- Resets timer on each value change
- Cleans up timeout on unmount

### spacesService

API service for space operations.

```typescript
interface SpacesService {
  getSpaces(params?: GetSpacesParams): Promise<Space[]>;
}

interface GetSpacesParams {
  search?: string;
  limit?: number;
  page?: number;
}
```

## Data Models

### Space Schema

```typescript
import { z } from "zod";

export const spaceSchema = z.object({
  id: z.number(),
  name: z.string(),
  status: z.enum(["active", "inactive", "archived"]),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type Space = z.infer<typeof spaceSchema>;

export const spaceListResponseSchema = z.array(spaceSchema);
export type SpaceListResponse = z.infer<typeof spaceListResponseSchema>;
```

### Query Parameters Schema

```typescript
export const getSpacesParamsSchema = z.object({
  search: z.string().optional(),
  limit: z.number().positive().optional(),
  page: z.number().positive().optional(),
});

export type GetSpacesParams = z.infer<typeof getSpacesParamsSchema>;
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Based on the prework analysis, the following correctness properties have been identified:

### Property 1: Debounce delays callback execution
*For any* sequence of rapid value changes to the debounce hook, the returned value SHALL only update after the specified delay has passed since the last change.
**Validates: Requirements 2.1**

### Property 2: Search parameter passed to API
*For any* non-empty search string, when the debounced search value changes, the API call SHALL include the search string as a query parameter.
**Validates: Requirements 2.2**

### Property 3: Limit parameter passed to API
*For any* valid limit value (10, 20, or 50), when the limit selection changes, the API call SHALL include the limit as a query parameter.
**Validates: Requirements 3.2**

### Property 4: Page resets when limit changes
*For any* limit change while on a page greater than 1, the page state SHALL reset to 1.
**Validates: Requirements 3.3**

### Property 5: Table rows contain required columns and actions
*For any* space data, the rendered table row SHALL contain the space name, status, formatted created date, and a View action button.
**Validates: Requirements 1.2, 4.1**

### Property 6: View action generates correct route
*For any* space with a valid ID, the View action link SHALL point to `/{locale}/{spaceId}`.
**Validates: Requirements 4.2**

## Error Handling

| Scenario | Handling |
|----------|----------|
| API fetch fails | Display error message, allow retry |
| Empty response | Display "No spaces found" message |
| Invalid response data | Log error, display generic error message |
| Network timeout | Display timeout error with retry option |

## Testing Strategy

### Property-Based Testing Library
- **Library:** fast-check
- **Minimum iterations:** 100 per property test

### Unit Tests
- Test `useDebounce` hook behavior
- Test `spacesService.getSpaces` with mocked HTTP client
- Test column definitions render correctly
- Test View action link generation

### Property-Based Tests
Each correctness property will be implemented as a property-based test:

1. **Property 1 test:** Generate random sequences of value changes with varying delays, verify debounced value only updates after delay
2. **Property 2 test:** Generate random search strings, verify API is called with correct search parameter
3. **Property 3 test:** Generate random limit selections from valid options, verify API is called with correct limit
4. **Property 4 test:** Generate random page numbers > 1 and limit changes, verify page resets to 1
5. **Property 5 test:** Generate random space objects, verify rendered row contains all required elements
6. **Property 6 test:** Generate random space IDs and locales, verify View action href matches expected pattern

### Test Annotations
All property-based tests MUST include:
- Comment: `**Feature: space-list, Property {number}: {property_text}**`
- Reference to validated requirements
