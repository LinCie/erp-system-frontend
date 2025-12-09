# Requirements Document

## Introduction

This feature enhances the centralized Ky-based HTTP client to automatically include Bearer token authentication in API requests. The access token stored in HTTP-only cookies will be retrieved and attached to outgoing requests as an Authorization header using Ky's `beforeRequest` hook, enabling authenticated API calls without manual token handling in each service method.

## Glossary

- **HTTP Client**: The centralized Ky-based HTTP client instance located at `@/shared/infrastructure/http`
- **Access Token**: A JWT token used for authenticating API requests, stored in an HTTP-only cookie named `access_token`
- **Bearer Token**: An authentication scheme where the access token is sent in the `Authorization` header with the format `Bearer <token>`
- **Authorization Header**: The HTTP header used to transmit authentication credentials in the format `Authorization: Bearer <token>`
- **beforeRequest Hook**: A Ky hook that intercepts outgoing requests before they are sent, allowing modification of request headers
- **Server Context**: Code execution environment in Server Components, Server Actions, or Route Handlers where Next.js `cookies()` API is available

## Requirements

### Requirement 1

**User Story:** As a developer, I want the HTTP client to automatically include the Bearer token in API requests using Ky's beforeRequest hook, so that I don't have to manually attach authentication headers in every service call.

#### Acceptance Criteria

1. WHEN the HTTP client makes a request AND an access token is available THEN the HTTP Client SHALL use a `beforeRequest` hook to set the `Authorization` header with the value `Bearer <access_token>`
2. WHEN the HTTP client makes a request AND no access token is available THEN the HTTP Client SHALL proceed with the request without an Authorization header
3. WHEN the access token is retrieved THEN the HTTP Client SHALL read from the cookie named `access_token`

### Requirement 2

**User Story:** As a developer, I want a dedicated authenticated HTTP client factory for server-side use, so that Server Actions and Server Components can make authenticated API calls.

#### Acceptance Criteria

1. WHEN creating an authenticated HTTP client for server use THEN the HTTP Client module SHALL provide a factory function that accepts the access token as a parameter
2. WHEN the factory function receives a valid access token THEN the HTTP Client SHALL return a Ky instance configured with a `beforeRequest` hook that sets the Authorization header
3. WHEN the factory function receives no token or an empty token THEN the HTTP Client SHALL return a Ky instance without authentication headers

### Requirement 3

**User Story:** As a developer, I want the base HTTP client to remain available for unauthenticated requests, so that public endpoints can be called without token attachment.

#### Acceptance Criteria

1. THE HTTP Client module SHALL continue to export the base `http` instance without automatic authentication for public API calls
2. WHEN a developer needs to make an unauthenticated request THEN the developer SHALL use the base `http` instance directly
