# AI Assistant Guide - ERP System Frontend

This guide provides comprehensive instructions for AI assistants working on the ERP System Frontend codebase. Follow these guidelines strictly to ensure consistency and quality.

## Table of Contents
- [Project Overview](#project-overview)
- [MCP Usage Requirements](#mcp-usage-requirements-critical)
- [Project Architecture](#project-architecture)
- [Code Generation Guidelines](#code-generation-guidelines)
- [Do's and Don'ts](#dos-and-donts)
- [Specific Patterns](#specific-patterns)
- [Testing & Quality](#testing--quality)

---

## Project Overview

### Tech Stack
- **Framework**: Next.js 16.0.7 with App Router
- **React**: 19.2.0
- **Language**: TypeScript 5 (strict mode enabled)
- **Styling**: Tailwind CSS 4 with shadcn/ui components
- **State Management**: Zustand 5.0.9
- **Form Handling**: React Hook Form 7.68.0 + Zod 4.1.13
- **HTTP Client**: ky 1.14.1
- **Internationalization**: next-intl 4.5.8
- **Rich Text Editor**: Lexical 0.39.0
- **Icons**: Lucide React
- **Theme**: next-themes for dark mode

### Key Features
- Multi-tenant ERP system with workspace support
- Module-based architecture (auth, dashboard, items, trades, spaces)
- Server actions for form submissions
- Client components for interactive UI
- Comprehensive type safety with TypeScript strict mode

---

## MCP Usage Requirements (CRITICAL)

### 🚨 ALWAYS Use Context7 MCP Before Generating Code

**MANDATORY**: Before writing any code, you MUST consult the Context7 MCP to:
1. Get up-to-date documentation for any library/framework
2. Verify best practices and patterns
3. Find code examples for specific implementations
4. Understand the latest API changes

**Process**:
```
1. Use resolve-library-id to find the correct library ID
2. Use query-docs to get specific implementation guidance
3. Only then write code based on verified documentation
```

**Example workflow**:
```
Task: Add a new form with validation
→ resolve-library-id: "react-hook-form"
→ query-docs: "How to implement form validation with Zod"
→ Write code based on verified docs
```

### 🧠 Use Sequential Thinking MCP for Complex Issues

**When to use**:
- Encountering difficult architectural decisions
- Debugging complex problems
- Designing new features that require careful planning
- Multi-step problem solving
- When unsure about the best approach

**Trigger automatically** for:
- Refactoring tasks affecting multiple modules
- Performance optimization challenges
- Integration between multiple systems
- Complex state management scenarios

### Available MCP Servers

1. **Context7 MCP** (@upstash/context7-mcp)
   - **Always use first** for any library documentation
   - Tools: `resolve-library-id`, `query-docs`
   - Limits: Max 3 calls per question

2. **Sequential Thinking MCP** (@modelcontextprotocol/server-sequential-thinking)
   - Use for complex problem-solving
   - Tools: `sequentialthinking`
   - Helps break down complex issues into steps

3. **Next.js MCP** (next-devtools)
   - Next.js development server integration
   - Tools: `nextjs_index`, `nextjs_call`, `nextjs_docs`, `browser_eval`
   - Use for diagnostics, route inspection, and Next.js-specific implementation guidance

4. **shadcn MCP** (shadcn)
   - shadcn/ui component registry and generation
   - Tools: `get_project_registries`, `list_items_in_registries`, `search_items_in_registries`, `view_items_in_registries`, `get_item_examples_from_registries`, `get_add_command_for_items`
   - Use for discovering, viewing examples, and adding shadcn/ui components

---

## Project Architecture

### Directory Structure

```
src/
├── app/                    # Next.js App Router
│   └── [locale]/          # Internationalization routes
│       ├── (app)/        # Authenticated routes
│       └── (auth)/       # Public authentication routes
├── components/           # Reusable UI components
│   └── ui/              # shadcn/ui components
├── modules/             # Feature modules
│   └── [module-name]/
│       ├── actions/     # Server actions
│       ├── components/  # Module-specific components
│       ├── schemas/     # Zod validation schemas
│       ├── services/    # API service layer
│       ├── store/       # Zustand stores
│       └── types/       # TypeScript types
├── shared/              # Shared utilities
│   ├── constants/       # Constants and configuration
│   ├── hooks/           # Custom React hooks
│   ├── infrastructure/  # Infrastructure layer (HTTP, etc.)
│   └── lib/             # Utility functions
```

### Module Pattern

Each feature module follows this structure:

1. **actions/** - Server actions for form submissions and mutations
2. **components/** - Module-specific React components
3. **schemas/** - Zod validation schemas
4. **services/** - API service layer functions
5. **store/** - Zustand state stores (if needed)
6. **types/** - TypeScript type definitions

### Path Aliases

Use the following path aliases consistently:
- `@/*` → `./src/*`
- `@/components` → `./src/components`
- `@/shared/lib` → `./src/shared/lib`
- `@/shared/hooks` → `./src/shared/hooks`

---

## Code Generation Guidelines

### Server Actions

Server actions are used for form submissions and data mutations. They must:
- Be marked with `"use server"`
- Follow the `ActionResult<T>` pattern
- Include comprehensive JSDoc comments
- Use the centralized `http` client for API calls

**Example**:
```typescript
"use server";

import { cookies } from "next/headers";
import type { ActionResult } from "@/shared/types/action-result";
import { createItemSchema, type Item } from "../schemas";
import { CreateItem } from "../services";

export async function createItemAction(
  spaceId: number,
  _prevState: ActionResult<Item>,
  formData: FormData
): Promise<ActionResult<Item>> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return { success: false, message: "Not authenticated" };
  }

  const rawData = {
    name: formData.get("name"),
    // ... other fields
  };

  const parsed = createItemSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      message: "Validation failed",
      errors: mapZodErrors(parsed.error),
    };
  }

  try {
    const item = await CreateItem({
      token: accessToken,
      data: parsed.data,
    });
    return { success: true, data: item };
  } catch (error) {
    // Handle errors using isHttpError and getErrorMessage
  }
}
```

### Client Components

Client components are used for interactive UI with:
- `"use client"` directive at the top
- React hooks for state management
- `useActionState` for form submissions
- `react-hook-form` for form handling

**Example**:
```typescript
"use client";

import { useActionState, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createItemAction } from "../actions/create-item-action";
import { createItemSchema, type CreateItemInput } from "../schemas";

export function CreateItemModal({ spaceId }: { spaceId: number }) {
  const [state, formAction, isPending] = useActionState(
    createItemAction.bind(null, spaceId),
    { success: false }
  );

  const form = useForm<CreateItemInput>({
    resolver: zodResolver(createItemSchema),
    defaultValues: { /* ... */ }
  });

  // Component implementation
}
```

### Service Layer

Service layer functions handle API calls using the centralized `http` client:
- Must be in `services/` directory
- Use the `http` client from `@/shared/infrastructure/http`
- Include TypeScript types for requests and responses
- Handle errors appropriately

**Example**:
```typescript
import { http } from "@/shared/infrastructure/http";
import type { CreateItemInput, Item } from "../schemas";

export async function CreateItem({
  token,
  data,
}: {
  token: string;
  data: CreateItemInput;
}): Promise<Item> {
  return await http
    .post("items", {
      json: data,
      context: { token },
    })
    .json();
}
```

### Zod Schemas

All data validation uses Zod schemas:
- Define in `schemas/` directory
- Export both schema and inferred types
- Include comprehensive validation rules

**Example**:
```typescript
import { z } from "zod";

export const createItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sku: z.string().optional(),
  price: z.string().min(1, "Price is required"),
  status: z.enum(["active", "inactive"]),
  // ... other fields
});

export type CreateItemInput = z.infer<typeof createItemSchema>;
export type Item = z.infer<typeof itemSchema>;
```

### shadcn/ui Components

- Use shadcn/ui components from `@/components/ui`
- Follow the "new-york" style variant
- All UI components are pre-generated in `src/components/ui/`
- Use Lucide React icons for all iconography
- Import from `lucide-react`

**Example**:
```typescript
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
```

---

## Do's and Don'ts

### ✅ DO

1. **ALWAYS use Context7 MCP** before generating code for any library
2. **Follow the module structure** pattern consistently
3. **Use React Hook Form + Zod** for all forms
4. **Implement server actions** for form submissions
5. **Use the centralized `http` client** for all API calls
6. **Include comprehensive JSDoc comments** for all functions
7. **Use TypeScript strict mode** - no `any` types
8. **Follow existing naming conventions** (camelCase for variables, PascalCase for components)
9. **Use path aliases** (`@/*`) for all imports
10. **Handle errors properly** with `isHttpError` and `getErrorMessage`
11. **Use `useSyncFormErrors`** hook to sync server errors to forms
12. **Separate server and client components** correctly
13. **Use Zustand** for global state management when needed
14. **Follow the file organization** within modules
15. **Use shadcn/ui components** for all UI elements
16. **Implement internationalization** with next-intl for all user-facing text
17. **Use semantic HTML** and accessibility best practices
18. **Add aria-labels** to form inputs and interactive elements
19. **Use Sequential Thinking MCP** for complex problems
20. **Follow the existing code style** (Prettier configuration)

### ❌ DON'T

1. **NEVER generate code without consulting Context7 MCP first**
2. **Don't use raw `fetch`** - always use the `http` client
3. **Don't create components outside established patterns**
4. **Don't skip validation schemas** - always use Zod
5. **Don't mix server and client logic** incorrectly
6. **Don't use `any` types** - use proper TypeScript types
7. **Don't ignore TypeScript strict mode errors**
8. **Don't bypass the module structure** - follow the established pattern
9. **Don't use inline styles** - use Tailwind CSS classes
10. **Don't create duplicate UI components** - use existing shadcn/ui components
11. **Don't hardcode strings** - use next-intl for translations
12. **Don't ignore error handling** - always handle API errors
13. **Don't use `console.log` in production code** - use proper logging
14. **Don't commit without linting** - run `bun run lint` and `bun run format`
15. **Don't create large files** - split into smaller, focused components
16. **Don't use prop drilling** - use Zustand stores for shared state
17. **Don't skip JSDoc comments** - document all functions
18. **Don't use inline event handlers** - separate into functions
19. **Don't ignore accessibility** - always use semantic HTML
20. **Don't break existing patterns** - follow the established conventions

---

## Specific Patterns

### Form Pattern

All forms follow this pattern:

1. **Zod Schema** in `schemas/`
2. **Server Action** in `actions/`
3. **Service Function** in `services/`
4. **Client Component** with:
   - `useForm` from react-hook-form
   - `zodResolver` for validation
   - `useActionState` for submission
   - `useSyncFormErrors` for error syncing

### Error Handling Pattern

```typescript
import { isHttpError, getErrorMessage } from "@/shared/infrastructure/http";

try {
  const result = await someApiCall();
} catch (error) {
  if (isHttpError(error)) {
    const apiError = error;
    return {
      success: false,
      message: apiError.apiMessage ?? "Request failed",
    };
  }
  return {
    success: false,
    message: getErrorMessage(error),
  };
}
```

### API Error Mapping Pattern

```typescript
import { mapApiErrors } from "@/shared/infrastructure/http";

if (isHttpError(error)) {
  const apiError = error as ApiError;
  return {
    success: false,
    message: apiError.apiMessage,
    errors: mapApiErrors(apiError),
  };
}
```

### File Upload Pattern

For file uploads (images, documents):
1. Request upload URL via `requestUploadUrlAction`
2. Upload file to R2 using the returned URL
3. Submit file metadata (name, path, size) with the form data

### Internationalization Pattern

```typescript
import { useTranslations } from "next-intl";

export function MyComponent() {
  const t = useTranslations("items");

  return <div>{t("create")}</div>;
}
```

### Zustand Store Pattern

```typescript
import { create } from "zustand";

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
```

---

## Testing & Quality

### Code Quality Tools

- **ESLint**: `bun run lint`
- **Prettier**: `bun run format`
- **Husky**: Pre-commit hooks for linting
- **lint-staged**: Runs linters on staged files

### Pre-commit Workflow

```bash
# Automatic on commit:
1. Prettier formats all staged files
2. ESLint checks for issues
3. Commit blocked if linting fails
```

### Development Workflow

```bash
# Start development server
bun run dev

# Run linting
bun run lint

# Format code
bun run format

# Build for production
bun run build
```

---

## MCP Command Reference

### Context7 MCP Usage

```typescript
// 1. Resolve library ID
→ resolve-library-id({
    query: "How to implement form validation with React Hook Form",
    libraryName: "react-hook-form"
  })

// 2. Query documentation
→ query-docs({
    libraryId: "/org/react-hook-form",
    query: "Form validation with Zod schema integration"
  })
```

### Sequential Thinking MCP Usage

```typescript
// For complex problems
→ sequentialthinking({
    thought: "First, I need to understand the problem...",
    nextThoughtNeeded: true,
    thoughtNumber: 1,
    totalThoughts: 5
  })
```

### Next.js MCP Usage

```typescript
// 1. Discover Next.js dev servers
→ nextjs_index()

// 2. Call a Next.js MCP tool
→ nextjs_call({
    port: "3000",
    toolName: "get_errors"
  })

// 3. Query Next.js documentation
→ nextjs_docs({
    path: "/docs/app/api-reference/functions/cookies"
  })
```

### shadcn MCP Usage

```typescript
// 1. Search for components
→ search_items_in_registries({
    registries: ["@shadcn"],
    query: "button"
  })

// 2. View component details
→ view_items_in_registries({
    items: ["@shadcn/button", "@shadcn/dialog"]
  })

// 3. Get examples
→ get_item_examples_from_registries({
    registries: ["@shadcn"],
    query: "button-demo"
  })

// 4. Get add command
→ get_add_command_for_items({
    items: ["@shadcn/button"]
  })
```

---

## Quick Reference

### Common Imports

```typescript
// React
import { useState, useEffect, useTransition } from "react";
import { useActionState } from "react";

// Forms
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
// ... other UI components

// Icons
import { Plus, Trash, Edit } from "lucide-react";

// Hooks
import { useTranslations } from "next-intl";
import { useSyncFormErrors } from "@/shared/hooks/use-sync-form-errors";

// Infrastructure
import { http, isHttpError, getErrorMessage } from "@/shared/infrastructure/http";

// Types
import type { ActionResult } from "@/shared/types/action-result";
```

### File Naming Conventions

- Components: `kebab-case.tsx` (e.g., `create-item-modal.tsx`)
- Server Actions: `kebab-case-action.ts` (e.g., `create-item-action.ts`)
- Services: `kebab-case.service.ts` (e.g., `create-item.service.ts`)
- Schemas: `kebab-case.schema.ts` (e.g., `create-item.schema.ts`)
- Types: `kebab-case.ts` (e.g., `schemas.ts` for exported types)
- Stores: `use-kebab-case-store.ts` (e.g., `use-auth-store.ts`)

---

## Final Checklist

Before generating any code, ensure you:

- [ ] Consulted Context7 MCP for library documentation
- [ ] Used Sequential Thinking MCP for complex problems
- [ ] Followed the module structure pattern
- [ ] Included proper TypeScript types
- [ ] Added comprehensive JSDoc comments
- [ ] Used appropriate hooks and patterns
- [ ] Followed existing naming conventions
- [ ] Implemented error handling
- [ ] Used the centralized `http` client
- [ ] Included internationalization where needed
- [ ] Followed accessibility best practices

---

**Remember**: This is a strict guide. Always follow these patterns and conventions to maintain code quality and consistency across the project.