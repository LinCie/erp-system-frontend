# Requirements Document

## Introduction

This document specifies the requirements for a user authentication system in the ERP frontend application. The system provides signup and signin functionality using JWT-based authentication with cookie storage. Users without a valid JWT cookie are redirected to the signin page. The implementation follows Next.js App Router patterns with server components where possible and client components only when necessary.

## API Reference

Base URL: Configured via `BACKEND_URL` environment variable (e.g., `http://127.0.0.1:8000`)

### Endpoints

- `POST /auth/signup` - Register a new user
  - Request: `{ name: string, email: string, password: string (min 6 chars) }`
  - Response 201: `{ access: string, refresh: string }`
  - Response 400: `{ message: string, issues: [{ code, message, path }] }`

- `POST /auth/signin` - Sign in with email and password
  - Request: `{ email: string, password: string }`
  - Response 200: `{ access: string, refresh: string }`
  - Response 400: `{ message: string, issues: [{ code, message, path }] }`

- `POST /auth/signout` - Sign out and invalidate refresh token
  - Request: `{ refreshToken: string }`
  - Response 204: No content

- `POST /auth/refresh` - Refresh access token
  - Request: `{ refreshToken: string }`
  - Response 200: `{ access: string, refresh: string }`

## Glossary

- **Auth System**: The authentication module responsible for user signup, signin, and session management
- **JWT Cookie**: A JSON Web Token stored as an HTTP-only cookie for session persistence
- **Auth Group**: A Next.js route group `(auth)` containing authentication-related pages
- **Ky Client**: The HTTP client library used for API communication
- **Zod Schema**: A TypeScript-first schema validation library for form and API data validation
- **Auth Store**: A Zustand store managing client-side authentication state
- **Shadcn Form**: The form component from shadcn/ui library with built-in validation support

## Requirements

### Requirement 1

**User Story:** As a new user, I want to create an account with my name, email and password, so that I can access the ERP system.

#### Acceptance Criteria

1. WHEN a user submits valid signup credentials (name, email, and password with minimum 6 characters) THEN the Auth System SHALL send a POST request to `/auth/signup` and store the returned JWT tokens as cookies
2. WHEN a user submits an email that already exists THEN the Auth System SHALL display the API error message without clearing the form
3. WHEN a user submits an invalid email format THEN the Auth System SHALL display a Zod validation error before submitting to the API
4. WHEN a user submits a password shorter than 6 characters THEN the Auth System SHALL display a validation error indicating the minimum length requirement
5. WHEN a user submits an empty name field THEN the Auth System SHALL display a validation error requiring a name
6. WHEN signup is successful THEN the Auth System SHALL redirect the user to the dashboard

### Requirement 2

**User Story:** As a returning user, I want to sign in with my credentials, so that I can access my account and the ERP system.

#### Acceptance Criteria

1. WHEN a user submits valid signin credentials THEN the Auth System SHALL authenticate with the API and store the JWT cookie
2. WHEN a user submits invalid credentials THEN the Auth System SHALL display an authentication error message
3. WHEN signin is successful THEN the Auth System SHALL redirect the user to the dashboard or intended destination
4. WHEN the signin form loads THEN the Auth System SHALL focus the email input field for immediate entry

### Requirement 3

**User Story:** As a system administrator, I want unauthenticated users to be redirected to signin, so that protected resources remain secure.

#### Acceptance Criteria

1. WHEN a user without a valid JWT cookie accesses a protected route THEN the Auth System SHALL redirect the user to the signin page
2. WHEN a user with a valid JWT cookie accesses the signin or signup page THEN the Auth System SHALL redirect the user to the dashboard
3. WHEN the JWT cookie expires or becomes invalid THEN the Auth System SHALL redirect the user to the signin page on the next protected route access

### Requirement 4

**User Story:** As a developer, I want form inputs validated using Zod schemas, so that data integrity is maintained at all IO boundaries.

#### Acceptance Criteria

1. WHEN form data is submitted THEN the Auth System SHALL validate all inputs against Zod schemas before API submission
2. WHEN API responses are received THEN the Auth System SHALL validate response data against Zod schemas
3. WHEN validation fails THEN the Auth System SHALL provide user-friendly error messages mapped to specific form fields

### Requirement 5

**User Story:** As a developer, I want API communication handled through a centralized Ky client, so that HTTP requests are consistent and maintainable.

#### Acceptance Criteria

1. WHEN the application initializes THEN the Auth System SHALL create a Ky client instance with `BACKEND_URL` environment variable as the prefixUrl
2. WHEN making API requests THEN the Auth System SHALL use the centralized Ky client instance from `src/shared/infrastructure/http.ts`
3. WHEN API errors occur THEN the Auth System SHALL handle HTTPError responses and extract error messages from the response body
4. WHEN serializing request data THEN the Auth System SHALL encode data using JSON format
5. WHEN deserializing response data THEN the Auth System SHALL decode JSON responses and validate against Zod schemas

### Requirement 6

**User Story:** As a user, I want the authentication forms to be responsive and accessible, so that I can use them on any device.

#### Acceptance Criteria

1. WHEN the auth pages render THEN the Auth System SHALL display mobile-first responsive layouts using Shadcn Form components
2. WHEN using keyboard navigation THEN the Auth System SHALL support full keyboard accessibility with proper focus management
3. WHEN screen readers access the forms THEN the Auth System SHALL provide appropriate ARIA labels and semantic HTML
4. WHEN form validation errors occur THEN the Shadcn Form SHALL display inline error messages below the respective input fields

### Requirement 7

**User Story:** As a developer, I want authentication state managed in a Zustand store, so that client components can reactively access auth status.

#### Acceptance Criteria

1. WHEN a user signs in successfully THEN the Auth Store SHALL update to reflect the authenticated state
2. WHEN a user signs out THEN the Auth Store SHALL clear the authentication state
3. WHEN components need auth status THEN the Auth Store SHALL provide reactive state access without prop drilling
