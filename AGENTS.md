# AI SYSTEM INSTRUCTIONS: ERP System Frontend

## SECTION 0: MANDATORY PRE-EXECUTION REQUIREMENTS

### 0.1 Context7 MCP (REQUIRED)

BEFORE generating code, EXECUTE:
1. `resolve-library-id("<library>")` → get library ID
2. `get-library-docs(libraryId, topic="<topic>")` → fetch docs
3. THEN generate code

LIBRARIES REQUIRING LOOKUP:
- `next.js` (App Router, Server Components, Server Actions)
- `react` (hooks, useActionState, React Compiler)
- `zod` (validation schemas)
- `zustand` (state management)
- `tailwindcss` (utility classes)
- `react-hook-form` (form handling)
- `next-intl` (internationalization)
- `@tanstack/react-table` (data tables)
- `ky` (HTTP client)

### 0.2 Shadcn MCP (REQUIRED FOR UI COMPONENTS)

FOR Shadcn UI work, USE Shadcn MCP tools (NOT Context7):
1. `search_items_in_registries(registries: ["@shadcn"], query: "<component>")`
2. `view_items_in_registries(items: ["@shadcn/<component>"])`
3. `get_item_examples_from_registries(registries: ["@shadcn"], query: "<component>-demo")`
4. `get_add_command_for_items(items: ["@shadcn/<component>"])`
5. `get_audit_checklist()` after creating components

CONFIGURED REGISTRIES: `@shadcn`, `@shadcn-studio`, `@ss-components`, `@ss-blocks`, `@ss-themes`, `@shadcn-io`

---

## SECTION 1: PROJECT METADATA

```yaml
name: erp-system-frontend
framework: Next.js 16.0.7 (App Router)
language: TypeScript (strict mode)
react: 19.2.0 (React Compiler enabled)
ui: Shadcn UI (new-york style, RSC enabled)
http: ky 1.14.1
validation: zod 4.x
state: zustand 5.x
forms: react-hook-form 7.x + @hookform/resolvers 5.x
styling: Tailwind CSS 4.x
i18n: next-intl 4.x
tables: @tanstack/react-table 8.x
icons: lucide-react
package_manager: bun (NEVER npm/yarn/pnpm)
```

---

## SECTION 2: DIRECTORY STRUCTURE

```
src/
├── app/                              # ROUTER LAYER (Server Components ONLY)
│   ├── [locale]/                     # Locale dynamic segment (next-intl)
│   │   ├── (app)/                    # Authenticated routes group
│   │   │   ├── [spaceId]/            # Space-scoped routes
│   │   │   ├── layout.tsx            # Dashboard layout with sidebar
│   │   │   └── page.tsx              # Dashboard home
│   │   ├── (auth)/                   # Authentication routes group
│   │   │   ├── signin/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   └── layout.tsx            # Centered card layout
│   │   ├── layout.tsx                # NextIntlClientProvider wrapper
│   │   └── not-found.tsx
│   ├── api/                          # API routes (currently empty - uses rewrites)
│   ├── layout.tsx                    # Root layout (html, body, font)
│   └── globals.css                   # Tailwind imports
├── components/                       # GLOBAL UI LAYER
│   ├── ui/                           # Shadcn UI components
│   ├── form-error-alert.tsx          # Shared form error display
│   └── language-switcher.tsx         # Locale switching component
├── modules/                          # DOMAIN LAYER (business logic)
│   ├── auth/                         # Authentication module
│   ├── dashboard/                    # Dashboard/layout module
│   └── spaces/                       # Spaces module
├── shared/                           # SHARED LAYER (cross-cutting)
│   ├── constants/                    # App-wide constants
│   ├── hooks/                        # Shared React hooks
│   ├── infrastructure/               # Core infrastructure
│   │   ├── http.ts                   # Ky HTTP client
│   │   └── i18n/                     # Internationalization
│   ├── lib/                          # Utility functions
│   └── types/                        # Shared TypeScript types
└── proxy.ts                          # Middleware (auth + i18n routing)
```

---

## SECTION 3: INTERNATIONALIZATION (next-intl)

### 3.1 Configuration

```typescript
// Supported locales
locales: ["id", "en"]  // Indonesian (default), English
defaultLocale: "id"
localePrefix: "always" // URLs always include locale: /id/signin, /en/signin
```

### 3.2 Route Structure

ALL routes are prefixed with `[locale]`:
- `/id/signin` - Indonesian signin
- `/en/signin` - English signin
- `/id/` - Indonesian dashboard
- `/en/` - English dashboard

### 3.3 Usage Patterns

**Server Components (pages, layouts):**
```typescript
import { getTranslations } from "next-intl/server";

export default async function Page() {
  const t = await getTranslations("namespace");
  return <h1>{t("key")}</h1>;
}
```

**Client Components:**
```typescript
"use client";
import { useTranslations } from "next-intl";

export function Component() {
  const t = useTranslations("namespace");
  return <span>{t("key")}</span>;
}
```

**Navigation (locale-aware):**
```typescript
import { Link, redirect, usePathname, useRouter } from "@/shared/infrastructure/i18n";

// Link automatically handles locale prefix
<Link href="/signin">Sign In</Link>
```

### 3.4 Message Files

Location: `src/shared/infrastructure/i18n/messages/{locale}.json`

Structure:
```json
{
  "common": { "loading": "Loading..." },
  "auth": {
    "signin": { "title": "Welcome back", "email": "Email" }
  },
  "metadata": {
    "signin": { "title": "Sign In", "description": "..." }
  }
}
```

---

## SECTION 4: LAYER RULES

### 4.1 `src/app/[locale]/` (Router Layer)

ALLOWED:
- Server Components ONLY
- Route definitions, layouts, metadata
- `getTranslations` for server-side i18n
- Import from `src/modules/*/components`
- Import from `src/components/ui`

FORBIDDEN:
- `useState`, `useEffect`, `useActionState`
- `"use client"` directive
- `useTranslations` (use `getTranslations` instead)
- Business logic
- Direct API calls

### 4.2 `src/modules/<name>/` (Domain Layer)

STRUCTURE:
```
modules/<module-name>/
├── actions/           # Server Actions with "use server"
│   └── <action>-action.ts
├── components/        # Client Components with "use client"
│   └── <component>.tsx
├── constants/         # Module-specific constants
│   └── <name>-config.ts
├── services/          # API service objects
│   └── <module>-service.ts
├── store/             # Zustand stores (optional)
│   └── use-<module>-store.ts
└── types/             # Zod schemas + TypeScript types
    └── schemas.ts
```

### 4.3 `src/components/` (Global UI Layer)

ALLOWED:
- Pure presentational components
- Shadcn UI base components
- Generic reusable atoms (form-error-alert, language-switcher)

FORBIDDEN:
- Business logic
- Module-specific imports
- Direct API calls

### 4.4 `src/shared/` (Shared Layer)

STRUCTURE:
```
shared/
├── constants/
│   ├── index.ts           # Re-exports
│   ├── pagination.ts      # DEFAULT_PAGINATION_META, LIMIT_OPTIONS
│   └── ui.ts              # SEARCH_DEBOUNCE_DELAY
├── hooks/
│   ├── index.ts           # Re-exports
│   ├── use-debounce.ts    # Debounce values
│   ├── use-mobile.ts      # Mobile breakpoint detection
│   └── use-sync-form-errors.ts  # Sync server errors to react-hook-form
├── infrastructure/
│   ├── http.ts            # Ky client with error handling
│   └── i18n/
│       ├── index.ts       # Re-exports routing, navigation
│       ├── routing.ts     # defineRouting config
│       ├── navigation.ts  # Link, redirect, usePathname, useRouter
│       ├── request.ts     # getRequestConfig for message loading
│       └── messages/      # Translation JSON files
│           ├── id.json
│           └── en.json
├── lib/
│   ├── index.ts           # Re-exports
│   ├── auth-cookies.ts    # setAuthCookies, clearAuthCookies
│   ├── pagination.ts      # getPageNumbers utility
│   ├── string-utils.ts    # getInitials utility
│   ├── utils.ts           # cn() utility
│   └── validation.ts      # mapZodErrors utility
└── types/
    ├── index.ts           # Re-exports
    ├── action-result.ts   # ActionResult<T>, initialActionState
    ├── api-schemas.ts     # errorResponseSchema
    ├── navigation.ts      # NavItem, NavSubItem, UserInfo, BreadcrumbItemConfig
    └── pagination.ts      # PaginationMeta, PaginationParams, PaginatedResponse<T>
```

---

## SECTION 5: CODE PATTERNS

### 5.1 Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files/Folders | kebab-case | `signin-form.tsx`, `auth-service.ts` |
| Components | PascalCase | `SigninForm`, `SpaceList` |
| Functions/Variables | camelCase | `signinAction`, `isAuthenticated` |
| Types/Interfaces | PascalCase | `SigninInput`, `ActionResult` |
| Zod Schemas | camelCase + Schema | `signinSchema`, `spaceListResponseSchema` |
| Zustand Stores | use + PascalCase + Store | `useAuthStore` |
| Server Actions | camelCase + Action | `signinAction`, `getSpacesAction` |
| Services | camelCase + Service | `authService`, `spacesService` |
| Translation keys | dot.notation | `auth.signin.title` |

### 5.2 HTTP Client Pattern

LOCATION: `@/shared/infrastructure/http`

```typescript
import { http, isHttpError, getErrorMessage, type ApiError } from "@/shared/infrastructure/http";

// In services - without auth:
const response = await http.post("auth/signin", { json: data }).json();
return schema.parse(response);

// In services - with auth token:
const response = await http.get("spaces", {
  context: { token: accessToken },
  searchParams: params,
}).json();
return schema.parse(response);
```

EXPORTS:
- `http` - Ky instance with prefixUrl: `${NEXT_PUBLIC_APP_URL}/api`
- `isHttpError(error)` - Type guard for HTTPError
- `getErrorMessage(error)` - Extract user-friendly message
- `ApiError` - Extended HTTPError with `apiMessage`, `apiIssues`

API PROXY: Next.js rewrites `/api/*` to `${BACKEND_URL}/*` (configured in next.config.ts)

### 5.3 Zod Validation Pattern

LOCATION: `src/modules/<module>/types/schemas.ts`

```typescript
import { z } from "zod";

// Re-export shared types for convenience
export { type ActionResult, initialActionState } from "@/shared/types/action-result";
export { type PaginationMeta, paginationMetaSchema } from "@/shared/types/pagination";

// Define schema
export const entitySchema = z.object({
  id: z.number(),
  name: z.string().min(1, "Name is required"),
  status: z.enum(["active", "inactive", "archived"]),
});

// Response schema with pagination
export const entityListResponseSchema = z.object({
  data: z.array(entitySchema),
  metadata: paginationMetaSchema,
});

// Infer types from schemas
export type Entity = z.infer<typeof entitySchema>;
export type EntityListResponse = z.infer<typeof entityListResponseSchema>;
```

RULES:
- ALL API responses MUST be validated with `.parse()`
- ALL form inputs MUST have Zod schemas
- Types MUST be inferred from schemas using `z.infer<>`
- Re-export shared types from module schemas.ts for convenience

### 5.4 ActionResult Pattern

LOCATION: `@/shared/types/action-result`

```typescript
// Generic ActionResult with optional data payload
export interface ActionResult<T = undefined> {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  data?: T;
}

// Initial state for useActionState
export const initialActionState: ActionResult = {
  success: false,
  message: undefined,
  errors: undefined,
};
```

USAGE:
- Form actions: `ActionResult` (no data)
- Data fetching actions: `ActionResult<ResponseType>`

### 5.5 Server Action Pattern (Form Submission)

LOCATION: `src/modules/<module>/actions/<action>-action.ts`

```typescript
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { moduleService } from "../services/<module>-service";
import { schema, type ActionResult } from "../types/schemas";
import { isHttpError, type ApiError } from "@/shared/infrastructure/http";
import { mapZodErrors } from "@/shared/lib/validation";

/**
 * Server action for form submission.
 * @param _prevState - Previous action state (required for useActionState)
 * @param formData - The form data
 * @returns ActionResult with success status and errors
 */
export async function submitAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  // 1. Extract form data
  const rawData = {
    field: formData.get("field"),
  };

  // 2. Validate with Zod
  const result = schema.safeParse(rawData);
  if (!result.success) {
    return {
      success: false,
      message: "Validation failed",
      errors: mapZodErrors(result.error),
    };
  }

  // 3. Call service
  try {
    await moduleService.method(result.data);
  } catch (error) {
    if (isHttpError(error)) {
      const apiError = error as ApiError;
      return {
        success: false,
        message: apiError.apiMessage ?? "Operation failed",
      };
    }
    return { success: false, message: "An unexpected error occurred" };
  }

  // 4. Redirect on success
  redirect("/destination");
}
```

### 5.6 Server Action Pattern (Data Fetching)

LOCATION: `src/modules/<module>/actions/<action>-action.ts`

```typescript
"use server";

import { cookies } from "next/headers";
import { moduleService } from "../services/<module>-service";
import { type ResponseType } from "../types/schemas";
import { type ActionResult } from "@/shared/types/action-result";
import { isHttpError, type ApiError } from "@/shared/infrastructure/http";

/**
 * Server Action to fetch data with authentication.
 * @param params - Optional query parameters
 * @returns ActionResult with data or error message
 */
export async function getDataAction(
  params?: QueryParams
): Promise<ActionResult<ResponseType>> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return { success: false, message: "Not authenticated" };
  }

  try {
    const data = await moduleService.getData(accessToken, params);
    return { success: true, data };
  } catch (error) {
    if (isHttpError(error)) {
      const apiError = error as ApiError;
      return { success: false, message: apiError.apiMessage ?? "Failed to fetch data" };
    }
    return { success: false, message: "An unexpected error occurred" };
  }
}
```

### 5.7 Service Pattern

LOCATION: `src/modules/<module>/services/<module>-service.ts`

```typescript
import { http } from "@/shared/infrastructure/http";
import { type InputType, type ResponseType, responseSchema } from "../types/schemas";

/**
 * Service for handling API operations.
 * All responses are validated against Zod schemas.
 */
export const moduleService = {
  /**
   * Fetches data with optional authentication.
   * @param token - Access token for authenticated requests
   * @param params - Optional query parameters
   * @returns Validated response data
   */
  async getData(token: string, params?: QueryParams): Promise<ResponseType> {
    const response = await http
      .get("endpoint", {
        context: { token },
        searchParams: params,
      })
      .json();
    return responseSchema.parse(response);
  },

  /**
   * Creates a new resource.
   * @param data - Input data
   * @returns Validated response
   */
  async create(data: InputType): Promise<ResponseType> {
    const response = await http.post("endpoint", { json: data }).json();
    return responseSchema.parse(response);
  },
};
```

### 5.8 Zustand Store Pattern

LOCATION: `src/modules/<module>/store/use-<module>-store.ts`

```typescript
import { create } from "zustand";

interface State {
  field: string;
  isLoading: boolean;
}

interface Actions {
  setField: (value: string) => void;
  setLoading: (value: boolean) => void;
  clear: () => void;
}

type Store = State & Actions;

/**
 * Zustand store for managing module state.
 * @example
 * ```tsx
 * const field = useModuleStore((state) => state.field);
 * const { setField, clear } = useModuleStore();
 * ```
 */
export const useModuleStore = create<Store>()((set) => ({
  // State
  field: "",
  isLoading: false,

  // Actions
  setField: (value) => set({ field: value }),
  setLoading: (value) => set({ isLoading: value }),
  clear: () => set({ field: "", isLoading: false }),
}));
```

### 5.9 Form Component Pattern

LOCATION: `src/modules/<module>/components/<form-name>.tsx`

```typescript
"use client";

import { useEffect, useRef, useActionState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { submitAction } from "../actions/<action>-action";
import { schema, type InputType, initialActionState } from "../types/schemas";
import { useSyncFormErrors } from "@/shared/hooks/use-sync-form-errors";
import { FormErrorAlert } from "@/components/form-error-alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/**
 * Form component with Zod validation and server action integration.
 * Auto-focuses first input on mount.
 * Syncs server-side errors with form state.
 */
export function FormComponent() {
  const t = useTranslations("namespace");
  const [state, formAction, isPending] = useActionState(submitAction, initialActionState);
  const inputRef = useRef<HTMLInputElement>(null);

  const form = useForm<InputType>({
    resolver: zodResolver(schema),
    defaultValues: { field: "" },
  });

  // Auto-focus first input
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Sync server errors to form
  useSyncFormErrors(form, state.errors);

  return (
    <Form {...form}>
      <form action={formAction} className="grid gap-4">
        {!state.success && <FormErrorAlert message={state.message} />}

        <FormField
          control={form.control}
          name="field"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("fieldLabel")}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  ref={(e) => {
                    field.ref(e);
                    (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = e;
                  }}
                  placeholder={t("fieldPlaceholder")}
                  disabled={isPending}
                  aria-label={t("fieldLabel")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="mt-2 w-full" disabled={isPending}>
          {isPending ? t("submitting") : t("submit")}
        </Button>
      </form>
    </Form>
  );
}
```

### 5.10 Data Table Component Pattern

LOCATION: `src/modules/<module>/components/<list-name>.tsx`

```typescript
"use client";
"use no memo"; // Required for TanStack Table with React Compiler

import { useState, useEffect, useMemo, useRef } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { useDebounce } from "@/shared/hooks/use-debounce";
import { getPageNumbers } from "@/shared/lib/pagination";
import { DEFAULT_PAGINATION_META, LIMIT_OPTIONS } from "@/shared/constants/pagination";
import { SEARCH_DEBOUNCE_DELAY } from "@/shared/constants/ui";
import { getDataAction } from "../actions/get-data-action";
import { type Entity, type EntityListResponse, type PaginationMeta } from "../types/schemas";
// ... UI component imports

interface ListProps {
  initialData: EntityListResponse;
  locale: string;
}

export function EntityList({ initialData, locale }: ListProps) {
  const t = useTranslations("module");
  const [data, setData] = useState<Entity[]>(initialData.data);
  const [meta, setMeta] = useState<PaginationMeta>(initialData.metadata ?? DEFAULT_PAGINATION_META);
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState<number>(LIMIT_OPTIONS[0]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_DELAY);
  const isInitialRender = useRef(true);

  const columns = useMemo<ColumnDef<Entity>[]>(() => [
    { accessorKey: "name", header: t("columns.name") },
    // ... more columns
  ], [t]);

  // eslint-disable-next-line react-hooks/incompatible-library -- React Compiler skips memoization for TanStack Table
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Fetch on filter changes (skip initial render)
  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    // ... fetch logic
  }, [debouncedSearch, limit, page]);

  // ... render table with search, pagination
}
```

IMPORTANT: Use `"use no memo"` directive at top of file for TanStack Table components to work with React Compiler.

### 5.11 Page Component Pattern (Server)

LOCATION: `src/app/[locale]/(app|auth)/<route>/page.tsx`

```typescript
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import { ModuleComponent } from "@/modules/<module>/components/<component>";
import { moduleService } from "@/modules/<module>/services/<module>-service";

type Props = {
  params: Promise<{ locale: string }>;
};

/**
 * Generates internationalized metadata.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.page" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

/**
 * Page server component.
 * Fetches initial data server-side and passes to client components.
 */
export default async function Page({ params }: Props) {
  const { locale } = await params;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  // Fetch initial data server-side
  let initialData = { data: [], metadata: DEFAULT_META };
  try {
    if (accessToken) {
      initialData = await moduleService.getData(accessToken, { limit: 10 });
    }
  } catch {
    // Pass empty data - component will handle refetching
  }

  return <ModuleComponent initialData={initialData} locale={locale} />;
}
```

---

## SECTION 6: STYLING RULES

### 6.1 Mobile-First (MANDATORY)

```tsx
// ✅ CORRECT: Mobile base → Desktop overrides
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
<div className="flex flex-col gap-3 sm:flex-row sm:items-center">

// ❌ WRONG: Desktop first
<div className="grid grid-cols-3 sm:grid-cols-1">
```

### 6.2 Width Handling

```tsx
// ✅ CORRECT: Fluid widths with max constraints
<div className="w-full max-w-sm sm:max-w-md">
<Input className="w-full sm:max-w-xs" />

// ❌ WRONG: Fixed pixels
<div className="w-[500px]">
```

### 6.3 Touch Targets

- Interactive elements: minimum 44px height on mobile
- Use `min-h-11` or `h-11` for buttons/inputs
- Ensure adequate spacing between clickable elements

### 6.4 Responsive Visibility

```tsx
// Hide on mobile, show on desktop
<div className="hidden sm:block">Desktop only</div>

// Show on mobile, hide on desktop
<div className="sm:hidden">Mobile only</div>
```

### 6.5 Utility Function

```typescript
import { cn } from "@/shared/lib/utils";

<div className={cn(
  "base-classes",
  conditional && "conditional-classes",
  variant === "primary" && "variant-classes"
)}>
```

---

## SECTION 7: IMPORT ALIASES

```typescript
"@/*" → "./src/*"

// Infrastructure
import { http, isHttpError, type ApiError } from "@/shared/infrastructure/http";
import { Link, redirect, usePathname, routing } from "@/shared/infrastructure/i18n";

// Shared utilities
import { cn } from "@/shared/lib/utils";
import { mapZodErrors } from "@/shared/lib/validation";
import { setAuthCookies, clearAuthCookies } from "@/shared/lib/auth-cookies";
import { getPageNumbers } from "@/shared/lib/pagination";
import { getInitials } from "@/shared/lib/string-utils";

// Shared hooks
import { useDebounce, useIsMobile, useSyncFormErrors } from "@/shared/hooks";

// Shared types
import { type ActionResult, initialActionState } from "@/shared/types/action-result";
import { type PaginationMeta, type PaginatedResponse } from "@/shared/types/pagination";
import { type NavItem, type UserInfo } from "@/shared/types/navigation";

// Shared constants
import { DEFAULT_PAGINATION_META, LIMIT_OPTIONS } from "@/shared/constants/pagination";
import { SEARCH_DEBOUNCE_DELAY } from "@/shared/constants/ui";

// UI Components
import { Button } from "@/components/ui/button";
import { FormErrorAlert } from "@/components/form-error-alert";

// Module imports
import { authService } from "@/modules/auth/services/auth-service";
import { SigninForm } from "@/modules/auth/components/signin-form";
```

---

## SECTION 8: JSDOC REQUIREMENTS

ALL exported functions/components MUST have JSDoc:

```typescript
/**
 * Brief description of purpose.
 * @param paramName - Parameter description
 * @returns Return value description
 * @throws Error conditions (if applicable)
 * @example
 * ```typescript
 * const result = await functionName(param);
 * ```
 */
```

---

## SECTION 9: ENVIRONMENT VARIABLES

```bash
# Backend API URL (used in next.config.ts rewrites)
BACKEND_URL=http://localhost:8000

# Frontend URL (used by HTTP client prefixUrl)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Node environment
NODE_ENV=development|production
```

---

## SECTION 10: POST-CODE COMMANDS

AFTER writing code, EXECUTE:

```bash
bun run lint --fix
```

NEVER use: `npm`, `yarn`, `pnpm`

---

## SECTION 11: VERIFICATION CHECKLIST

BEFORE completing task, VERIFY:

```
[ ] Context7/Shadcn MCP lookup performed
[ ] File names are kebab-case
[ ] Component names are PascalCase
[ ] src/app/[locale]/ has NO useState/useEffect/useActionState
[ ] src/app/[locale]/ uses getTranslations (NOT useTranslations)
[ ] Client components use useTranslations from next-intl
[ ] Navigation uses Link from @/shared/infrastructure/i18n
[ ] HTTP calls use @/shared/infrastructure/http
[ ] All inputs validated with Zod
[ ] Types inferred from Zod schemas (z.infer<>)
[ ] ActionResult<T> used for server actions
[ ] useSyncFormErrors used in form components
[ ] JSDoc comments on all exports
[ ] No `any` types
[ ] Mobile-first styling (base → sm: → md: → lg:)
[ ] No fixed pixel widths
[ ] TanStack Table components have "use no memo" directive
[ ] Translation keys added to both id.json and en.json
[ ] Ran `bun run lint --fix`
```

---

## SECTION 12: FILE CREATION DECISION TREE

```
Is it a route/page?
  YES → src/app/[locale]/(app|auth)/<route>/page.tsx
  NO ↓

Is it a Shadcn UI component?
  YES → src/components/ui/<component>.tsx (use shadcn add command)
  NO ↓

Is it a shared presentational component?
  YES → src/components/<component>.tsx
  NO ↓

Is it domain-specific?
  YES → src/modules/<domain>/
    ├── Server Action? → actions/<name>-action.ts
    ├── Client Component? → components/<name>.tsx
    ├── API Service? → services/<domain>-service.ts
    ├── Zustand Store? → store/use-<domain>-store.ts
    ├── Zod Schema? → types/schemas.ts
    └── Constants? → constants/<name>-config.ts
  NO ↓

Is it shared infrastructure?
  YES → src/shared/infrastructure/<name>.ts
  NO ↓

Is it a shared hook?
  YES → src/shared/hooks/use-<name>.ts (add to index.ts)
  NO ↓

Is it a shared utility?
  YES → src/shared/lib/<name>.ts (add to index.ts)
  NO ↓

Is it a shared type?
  YES → src/shared/types/<name>.ts (add to index.ts)
  NO ↓

Is it a shared constant?
  YES → src/shared/constants/<name>.ts (add to index.ts)
  NO → Ask for clarification
```

---

## SECTION 13: EXISTING MODULES REFERENCE

### 13.1 Auth Module (`src/modules/auth/`)

```
auth/
├── actions/
│   ├── signin-action.ts      # Form action → redirect to /
│   ├── signup-action.ts      # Form action → redirect to /
│   └── signout-action.ts     # Simple action → redirect to /signin
├── components/
│   ├── signin-form.tsx       # Email + password form
│   ├── signup-form.tsx       # Name + email + password form
│   └── signout-button.tsx    # Button triggering signout
├── services/
│   └── auth-service.ts       # signup, signin, signout, refresh
├── store/
│   └── use-auth-store.ts     # isAuthenticated state
└── types/
    └── schemas.ts            # signinSchema, signupSchema, tokensResponseSchema
```

### 13.2 Dashboard Module (`src/modules/dashboard/`)

```
dashboard/
├── components/
│   ├── app-sidebar.tsx       # Main sidebar with nav + user
│   ├── nav-main.tsx          # Navigation menu items
│   ├── nav-user.tsx          # User dropdown in footer
│   └── site-header.tsx       # Sticky header with breadcrumbs
└── constants/
    └── navigation-config.ts  # mainNavItems, secondaryNavItems
```

### 13.3 Spaces Module (`src/modules/spaces/`)

```
spaces/
├── actions/
│   └── get-spaces-action.ts  # Data fetching with auth
├── components/
│   └── space-list.tsx        # Data table with search + pagination
├── services/
│   └── spaces-service.ts     # getSpaces with token
└── types/
    └── schemas.ts            # spaceSchema, spaceListResponseSchema
```

---

## SECTION 14: FORBIDDEN PATTERNS

```typescript
// ❌ NEVER DO:

// Wrong HTTP client
import axios from "axios";           // Use http from @/shared/infrastructure/http
fetch("url");                        // Use http from @/shared/infrastructure/http

// Wrong package manager
npm install                          // Use bun add
yarn add                             // Use bun add
pnpm add                             // Use bun add

// Wrong types
const x: any = ...;                  // Use proper types

// Wrong layer violations
"use client" in src/app/[locale]/    // Keep app layer server-only
useState in src/app/[locale]/        // Keep app layer server-only
useTranslations in src/app/[locale]/ // Use getTranslations for server components
Business logic in src/components/    // Use src/modules/

// Wrong navigation
import Link from "next/link";        // Use Link from @/shared/infrastructure/i18n
import { redirect } from "next/navigation"; // Use redirect from @/shared/infrastructure/i18n (in client)

// Wrong i18n in server components
useTranslations("namespace");        // Use getTranslations for server components

// Missing directives for TanStack Table
// Components using useReactTable MUST have "use no memo" at top
```

---

## SECTION 15: MIDDLEWARE (src/proxy.ts)

The middleware handles:
1. **i18n routing** - Locale prefix management via next-intl
2. **Auth protection** - Token validation and refresh
3. **Route guards** - Redirect authenticated users from auth pages

```typescript
// Public routes (no auth required)
const PUBLIC_ROUTES = ["/signin", "/signup"];

// Auth routes (redirect to home if authenticated)
const AUTH_ROUTES = ["/signin", "/signup"];
```

Token flow:
1. Check for access_token cookie
2. If valid → proceed
3. If invalid/missing → try refresh with refresh_token
4. If refresh succeeds → set new cookies, proceed
5. If refresh fails → clear cookies, redirect to /signin

---

## SECTION 16: AUTHENTICATION FLOW

### Cookies Used:
- `access_token` - JWT access token (15 min expiry)
- `refresh_token` - JWT refresh token (7 day expiry)
- `sidebar_state` - Sidebar open/closed state

### Auth Functions:
```typescript
// Set tokens after signin/signup
import { setAuthCookies } from "@/shared/lib/auth-cookies";
const cookieStore = await cookies();
setAuthCookies(cookieStore, { access: "...", refresh: "..." });

// Clear tokens on signout
import { clearAuthCookies } from "@/shared/lib/auth-cookies";
clearAuthCookies(cookieStore);
```

### Protected API Calls:
```typescript
// In server actions - get token from cookies
const cookieStore = await cookies();
const accessToken = cookieStore.get("access_token")?.value;

// Pass to service
const data = await moduleService.getData(accessToken, params);

// In service - use context for Bearer token
const response = await http.get("endpoint", {
  context: { token: accessToken },
}).json();
```

---

## SECTION 17: EXAMPLE MODULE CREATION

USER: "Create a products module with CRUD"

AI EXECUTION:

1. **Context7 lookup**: Fetch Next.js, React, Zod, react-hook-form docs
2. **Create structure**:

```
src/modules/products/
├── actions/
│   ├── get-products-action.ts
│   ├── create-product-action.ts
│   ├── update-product-action.ts
│   └── delete-product-action.ts
├── components/
│   ├── product-list.tsx
│   ├── product-form.tsx
│   └── product-delete-dialog.tsx
├── services/
│   └── products-service.ts
└── types/
    └── schemas.ts
```

3. **Add translations** to both `id.json` and `en.json`
4. **Create page** at `src/app/[locale]/(app)/products/page.tsx`
5. **Run**: `bun run lint --fix`

---

## SECTION 18: QUICK REFERENCE

### Shared Hooks
| Hook | Purpose |
|------|---------|
| `useDebounce(value, delay)` | Debounce rapidly changing values |
| `useIsMobile()` | Detect mobile viewport |
| `useSyncFormErrors(form, errors)` | Sync server errors to react-hook-form |

### Shared Utilities
| Function | Purpose |
|----------|---------|
| `cn(...classes)` | Merge Tailwind classes |
| `mapZodErrors(zodError)` | Convert Zod errors to field map |
| `getPageNumbers(current, total)` | Generate pagination numbers |
| `getInitials(name)` | Get initials from name |
| `setAuthCookies(store, tokens)` | Set JWT cookies |
| `clearAuthCookies(store)` | Clear JWT cookies |

### Shared Constants
| Constant | Value |
|----------|-------|
| `DEFAULT_PAGINATION_META` | `{ currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 10 }` |
| `LIMIT_OPTIONS` | `[10, 20, 50]` |
| `SEARCH_DEBOUNCE_DELAY` | `300` (ms) |
