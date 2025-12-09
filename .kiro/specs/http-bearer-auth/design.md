# Design Document: HTTP Bearer Token Authentication

## Overview

This feature enhances the centralized Ky-based HTTP client to support Bearer token authentication. The implementation uses Ky's `beforeRequest` hook to automatically attach the Authorization header to outgoing requests. A factory function pattern is used to create authenticated HTTP client instances, allowing Server Actions and Server Components to pass the access token retrieved from cookies.

## Architecture

The solution follows a factory pattern where:
1. The base `http` instance remains unchanged for unauthenticated requests
2. A new `createAuthenticatedHttp(token)` factory function creates authenticated Ky instances
3. The factory uses Ky's `extend()` method to add a `beforeRequest` hook that sets the Authorization header

```
┌─────────────────────────────────────────────────────────────┐
│                    Server Action / Component                 │
├─────────────────────────────────────────────────────────────┤
│  1. const cookieStore = await cookies()                     │
│  2. const token = cookieStore.get('access_token')?.value    │
│  3. const authHttp = createAuthenticatedHttp(token)         │
│  4. await authHttp.get('protected-endpoint')                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              createAuthenticatedHttp(token)                  │
├─────────────────────────────────────────────────────────────┤
│  return http.extend({                                        │
│    hooks: {                                                  │
│      beforeRequest: [                                        │
│        (request) => {                                        │
│          if (token) {                                        │
│            request.headers.set('Authorization',              │
│              `Bearer ${token}`)                              │
│          }                                                   │
│        }                                                     │
│      ]                                                       │
│    }                                                         │
│  })                                                          │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### Modified File: `src/shared/infrastructure/http.ts`

#### New Export: `createAuthenticatedHttp`

```typescript
/**
 * Creates an authenticated Ky HTTP client instance with Bearer token.
 * Uses Ky's beforeRequest hook to attach the Authorization header.
 * 
 * @param token - The access token to use for authentication (optional)
 * @returns A Ky instance configured with Bearer token authentication
 * 
 * @example
 * ```typescript
 * // In a Server Action
 * const cookieStore = await cookies();
 * const token = cookieStore.get('access_token')?.value;
 * const authHttp = createAuthenticatedHttp(token);
 * const data = await authHttp.get('protected-endpoint').json();
 * ```
 */
export function createAuthenticatedHttp(token?: string): typeof http;
```

### Existing Exports (Unchanged)

- `http` - Base Ky instance for unauthenticated requests
- `isHttpError` - Type guard for HTTPError
- `getErrorMessage` - Extract user-friendly error message
- `ApiError` - Extended HTTPError type
- `ApiErrorResponse` - Error response structure

## Data Models

No new data models are required. The feature uses existing types:

- `string` for the access token
- Ky's built-in `Request` type for request modification
- Existing `http` instance configuration

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Valid token results in Authorization header

*For any* non-empty access token string, when `createAuthenticatedHttp(token)` is called and a request is made, the request SHALL have an `Authorization` header with the value `Bearer <token>`.

**Validates: Requirements 1.1, 2.2**

### Property 2: Empty or undefined token results in no Authorization header

*For any* empty string, undefined, or null token value, when `createAuthenticatedHttp(token)` is called and a request is made, the request SHALL NOT have an `Authorization` header.

**Validates: Requirements 1.2, 2.3**

### Property 3: Token value is preserved exactly in header

*For any* non-empty access token string, the token value in the Authorization header SHALL be exactly equal to the input token (no modification, trimming, or encoding).

**Validates: Requirements 1.1**

## Error Handling

| Scenario | Behavior |
|----------|----------|
| Token is undefined | Request proceeds without Authorization header |
| Token is empty string | Request proceeds without Authorization header |
| Token is null | Request proceeds without Authorization header |
| Token contains special characters | Token is used as-is in the header |

The factory function does not throw errors for invalid tokens. It gracefully handles missing tokens by simply not attaching the Authorization header, allowing the API to return appropriate 401 responses.

## Testing Strategy

### Property-Based Testing

The implementation will use **fast-check** as the property-based testing library to verify correctness properties.

Each property-based test MUST:
- Run a minimum of 100 iterations
- Be tagged with a comment referencing the correctness property: `**Feature: http-bearer-auth, Property {number}: {property_text}**`
- Generate random token strings to verify behavior across the input space

### Unit Tests

Unit tests will cover:
- Factory function returns a Ky instance
- Base `http` instance remains exported and functional
- Integration with existing error handling hooks

### Test File Location

Tests will be located at: `src/shared/infrastructure/__tests__/http.test.ts`
