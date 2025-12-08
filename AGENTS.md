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
forms: react-hook-form 7.x + @hookform/resolvers
styling: Tailwind CSS 4.x
package_manager: bun (NEVER npm/yarn/pnpm)
```

---

## SECTION 2: DIRECTORY STRUCTURE

```
src/
├── app/                          # ROUTER LAYER (Server Components ONLY)
│   ├── (app)/                    # Authenticated routes group
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── (auth)/                   # Authentication routes group
│   │   ├── signin/
│   │   ├── signup/
│   │   └── layout.tsx
│   ├── layout.tsx                # Root layout
│   └── globals.css
├── components/                   # GLOBAL UI LAYER (Shadcn + atoms)
│   └── ui/                       # Shadcn UI components
│       ├── button.tsx
│       ├── card.tsx
│       ├── form.tsx
│       ├── input.tsx
│       └── label.tsx
├── modules/                      # DOMAIN LAYER (business logic)
│   └── <module-name>/
│       ├── actions/              # Server Actions ("use server")
│       ├── components/           # Module-specific UI components
│       ├── constants/            # Module constants
│       ├── services/             # API calls using http client
│       ├── store/                # Zustand stores
│       └── types/                # Zod schemas + TypeScript types
└── shared/                       # SHARED LAYER (cross-cutting)
    ├── infrastructure/
    │   └── http.ts               # Ky HTTP client singleton
    └── lib/
        └── utils.ts              # cn() utility
```

---

## SECTION 3: LAYER RULES

### 3.1 `src/app/` (Router Layer)

ALLOWED:
- Server Components ONLY
- Route definitions, layouts, metadata
- Import from `src/modules/*/components`
- Import from `src/components/ui`

FORBIDDEN:
- `useState`, `useEffect`, `useActionState`
- `"use client"` directive (except unavoidable wrappers)
- Business logic
- Direct API calls

### 3.2 `src/modules/<name>/` (Domain Layer)

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
├── store/             # Zustand stores
│   └── use-<module>-store.ts
└── types/             # Zod schemas + inferred types
    └── schemas.ts
```

### 3.3 `src/components/` (Global UI Layer)

ALLOWED:
- Pure presentational components
- Shadcn UI base components
- Generic reusable atoms

FORBIDDEN:
- Business logic
- Module-specific imports
- Direct API calls

### 3.4 `src/shared/` (Shared Layer)

STRUCTURE:
```
shared/
├── infrastructure/
│   └── http.ts        # Ky client with error handling
└── lib/
    └── utils.ts       # cn() and generic utilities
```

---

## SECTION 4: CODE PATTERNS

### 4.1 Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files/Folders | kebab-case | `signin-form.tsx`, `auth-service.ts` |
| Components | PascalCase | `SigninForm`, `ProductCard` |
| Functions/Variables | camelCase | `signinAction`, `isAuthenticated` |
| Types/Interfaces | PascalCase | `SigninInput`, `ActionResult` |
| Zod Schemas | camelCase + Schema | `signinSchema`, `tokensResponseSchema` |
| Zustand Stores | use + PascalCase + Store | `useAuthStore` |
| Server Actions | camelCase + Action | `signinAction`, `signupAction` |
| Services | camelCase + Service | `authService` |

### 4.2 HTTP Client Pattern

LOCATION: `@/shared/infrastructure/http`

```typescript
import { http, isHttpError, getErrorMessage, type ApiError } from "@/shared/infrastructure/http";

// In services:
const response = await http.post("endpoint", { json: data }).json();
return schema.parse(response);
```

EXPORTS:
- `http` - Ky instance with prefixUrl from BACKEND_URL env
- `isHttpError(error)` - Type guard for HTTPError
- `getErrorMessage(error)` - Extract user-friendly message
- `ApiError` - Extended HTTPError type with apiMessage, apiIssues

### 4.3 Zod Validation Pattern

LOCATION: `src/modules/<module>/types/schemas.ts`

```typescript
import { z } from "zod";

// Define schema
export const entitySchema = z.object({
  field: z.string().min(1, "Field is required"),
});

// Infer type from schema
export type EntityInput = z.infer<typeof entitySchema>;
```

RULES:
- ALL API responses MUST be validated with `.parse()`
- ALL form inputs MUST have Zod schemas
- Types MUST be inferred from schemas using `z.infer<>`

### 4.4 Server Action Pattern

LOCATION: `src/modules/<module>/actions/<action>-action.ts`

```typescript
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { service } from "../services/<module>-service";
import { schema, type ActionResult } from "../types/schemas";
import { isHttpError, type ApiError } from "@/shared/infrastructure/http";

export async function exampleAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  // 1. Extract form data
  const rawData = { field: formData.get("field") };

  // 2. Validate with Zod
  const result = schema.safeParse(rawData);
  if (!result.success) {
    const errors: Record<string, string[]> = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0]?.toString() ?? "form";
      if (!errors[field]) errors[field] = [];
      errors[field].push(issue.message);
    }
    return { success: false, message: "Validation failed", errors };
  }

  // 3. Call service
  try {
    await service.method(result.data);
  } catch (error) {
    if (isHttpError(error)) {
      const apiError = error as ApiError;
      return { success: false, message: apiError.apiMessage ?? "Error" };
    }
    return { success: false, message: "An unexpected error occurred" };
  }

  // 4. Redirect on success
  redirect("/destination");
}
```

### 4.5 Service Pattern

LOCATION: `src/modules/<module>/services/<module>-service.ts`

```typescript
import { http } from "@/shared/infrastructure/http";
import { type InputType, type ResponseType, responseSchema } from "../types/schemas";

export const moduleService = {
  async method(data: InputType): Promise<ResponseType> {
    const response = await http.post("endpoint", { json: data }).json();
    return responseSchema.parse(response);
  },
};
```

### 4.6 Zustand Store Pattern

LOCATION: `src/modules/<module>/store/use-<module>-store.ts`

```typescript
import { create } from "zustand";

interface State { /* state fields */ }
interface Actions { /* action methods */ }
type Store = State & Actions;

export const useModuleStore = create<Store>()((set) => ({
  // state
  field: initialValue,
  // actions
  setField: (value) => set({ field: value }),
  clear: () => set({ field: initialValue }),
}));
```

### 4.7 Form Component Pattern

LOCATION: `src/modules/<module>/components/<form-name>.tsx`

```typescript
"use client";

import { useEffect, useRef, useActionState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { action } from "../actions/<action>-action";
import { schema, type InputType, type ActionResult } from "../types/schemas";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const initialState: ActionResult = { success: false };

export function FormComponent() {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const inputRef = useRef<HTMLInputElement>(null);

  const form = useForm<InputType>({
    resolver: zodResolver(schema),
    defaultValues: { /* defaults */ },
  });

  // Auto-focus first input
  useEffect(() => { inputRef.current?.focus(); }, []);

  // Sync server errors to form
  useEffect(() => {
    if (state.errors) {
      Object.entries(state.errors).forEach(([field, messages]) => {
        if (messages?.length) {
          form.setError(field as keyof InputType, { type: "server", message: messages[0] });
        }
      });
    }
  }, [state.errors, form]);

  return (
    <Form {...form}>
      <form action={formAction} className="grid gap-4">
        {state.message && !state.success && (
          <div role="alert" aria-live="polite" className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
            {state.message}
          </div>
        )}
        {/* FormFields */}
        <Button type="submit" className="mt-2 w-full" disabled={isPending}>
          {isPending ? "Loading..." : "Submit"}
        </Button>
      </form>
    </Form>
  );
}
```

---

## SECTION 5: STYLING RULES

### 5.1 Mobile-First (MANDATORY)

```tsx
// ✅ CORRECT: Mobile base → Desktop overrides
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

// ❌ WRONG: Desktop first
<div className="grid grid-cols-3 sm:grid-cols-1">
```

### 5.2 Width Handling

```tsx
// ✅ CORRECT: Fluid widths
<div className="w-full max-w-sm sm:max-w-md">

// ❌ WRONG: Fixed pixels
<div className="w-[500px]">
```

### 5.3 Touch Targets

- Interactive elements: minimum 44px height on mobile
- Use `min-h-11` or `h-11` for buttons/inputs

### 5.4 Utility Function

```typescript
import { cn } from "@/shared/lib/utils";

<div className={cn("base-classes", conditional && "conditional-classes")}>
```

---

## SECTION 6: IMPORT ALIASES

```typescript
"@/*" → "./src/*"

// Examples:
import { http } from "@/shared/infrastructure/http";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/components/ui/button";
import { authService } from "@/modules/auth/services/auth-service";
```

---

## SECTION 7: JSDOC REQUIREMENTS

ALL exported functions/components MUST have JSDoc:

```typescript
/**
 * Brief description of purpose.
 * @param paramName - Parameter description
 * @returns Return value description
 * @throws Error conditions
 * @example
 * ```typescript
 * const result = await functionName(param);
 * ```
 */
```

---

## SECTION 8: POST-CODE COMMANDS

AFTER writing code, EXECUTE:

```bash
bun run lint --fix
```

NEVER use: `npm`, `yarn`, `pnpm`

---

## SECTION 9: VERIFICATION CHECKLIST

BEFORE completing task, VERIFY:

```
[ ] Context7/Shadcn MCP lookup performed
[ ] File names are kebab-case
[ ] Component names are PascalCase
[ ] src/app/ has NO useState/useEffect/useActionState
[ ] HTTP calls use @/shared/infrastructure/http
[ ] All inputs validated with Zod
[ ] Types inferred from Zod schemas (z.infer<>)
[ ] JSDoc comments on all exports
[ ] No `any` types
[ ] Mobile-first styling (base → sm: → md: → lg:)
[ ] No fixed pixel widths
[ ] Ran `bun run lint --fix`
```

---

## SECTION 10: FILE CREATION DECISION TREE

```
Is it a route/page?
  YES → src/app/(app|auth)/<route>/page.tsx
  NO ↓

Is it a Shadcn UI component?
  YES → src/components/ui/<component>.tsx
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

Is it a shared utility?
  YES → src/shared/lib/<name>.ts
  NO → Ask for clarification
```

---

## SECTION 11: COMMON ACTIONRESULT TYPE

```typescript
export interface ActionResult {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
}
```

USE in all Server Actions for consistent error handling.

---

## SECTION 12: ENVIRONMENT VARIABLES

```
BACKEND_URL - API base URL (used by http client prefixUrl)
NODE_ENV - production | development
```

---

## SECTION 13: FORBIDDEN PATTERNS

```typescript
// ❌ NEVER DO:
import axios from "axios";           // Use http from @/shared/infrastructure/http
fetch("url");                        // Use http from @/shared/infrastructure/http
npm install                          // Use bun add
yarn add                             // Use bun add
const x: any = ...;                  // Use proper types
"use client" in src/app/             // Keep app layer server-only
useState in src/app/                 // Keep app layer server-only
Business logic in src/components/    // Use src/modules/
```

---

## SECTION 14: EXAMPLE MODULE CREATION

USER: "Create a products module"

AI EXECUTION:
1. Context7: Fetch Next.js, React, Zod docs
2. Create structure:

```
src/modules/products/
├── actions/
│   └── create-product-action.ts
├── components/
│   └── product-form.tsx
├── services/
│   └── products-service.ts
├── store/
│   └── use-products-store.ts
└── types/
    └── schemas.ts
```

3. Run: `bun run lint --fix`
