# Implementation Plan

- [-] 1. Implement the createAuthenticatedHttp factory function
  - [x] 1.1 Add the createAuthenticatedHttp function to src/shared/infrastructure/http.ts
    - Use Ky's `extend()` method to create a new instance from the base `http`
    - Add a `beforeRequest` hook that sets the Authorization header when token is provided
    - Handle empty/undefined/null tokens by not setting the header
    - Add JSDoc documentation with usage example
    - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.3_
  - [ ]* 1.2 Write property test for valid token Authorization header
    - **Property 1: Valid token results in Authorization header**
    - **Validates: Requirements 1.1, 2.2**
  - [ ]* 1.3 Write property test for empty/undefined token handling
    - **Property 2: Empty or undefined token results in no Authorization header**
    - **Validates: Requirements 1.2, 2.3**
  - [ ]* 1.4 Write property test for token value preservation
    - **Property 3: Token value is preserved exactly in header**
    - **Validates: Requirements 1.1**

- [x] 2. Update auth service to use authenticated HTTP client
  - [x] 2.1 Update authService methods that require authentication to accept an optional authenticated http instance
    - Modify signout method to use authenticated http when provided
    - Modify refresh method signature if needed
    - _Requirements: 2.1, 2.2_

- [x] 3. Update Server Actions to use authenticated HTTP client
  - [x] 3.1 Update signout-action.ts to use createAuthenticatedHttp
    - Retrieve access token from cookies
    - Create authenticated http instance
    - Pass to authService.signout if needed
    - _Requirements: 1.1, 1.3, 2.1_

- [ ] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
