# Implementation Plan: User Authentication

## Overview

This plan implements user authentication for the Cody AI Agent application using AWS Cognito. The implementation spans both the FastAPI backend (Python) and the Next.js frontend (TypeScript). Tasks are ordered so each step builds on the previous, starting with backend infrastructure (models, middleware), then backend routes, then frontend auth layer, then frontend UI pages, and finally integration wiring.

## Tasks

- [x] 1. Backend auth infrastructure and models
  - [x] 1.1 Create Pydantic models for auth requests and responses (`src/models.py`)
    - Define `RegisterRequest`, `VerifyRequest`, `LoginRequest`, `RefreshRequest`, `TokenResponse`, `UserInfo`, `MessageResponse`, `UserSettings`, `UserSettingsUpdate` models
    - Add password validation logic as a Pydantic validator (8+ chars, uppercase, lowercase, digit, special character)
    - Add settings validation (display_name 1-50 chars, theme in ["light", "dark"], language in ["en", "fr", "ar"])
    - _Requirements: 1.4, 5.4_

  - [x] 1.2 Write property test for password validation (Property 1)
    - **Property 1: Password Validation Correctness**
    - Use `hypothesis` to generate random strings and verify the validator reports exactly the violated rules
    - **Validates: Requirements 1.4**

  - [x] 1.3 Write property test for settings validation (Property 5)
    - **Property 5: Settings Validation Correctness**
    - Use `hypothesis` to generate random settings objects and verify acceptance/rejection matches the rules
    - **Validates: Requirements 5.4, 5.5**

  - [x] 1.4 Implement JWT verification middleware (`src/middleware.py`)
    - Create `JWTVerifier` class that fetches and caches JWKS from Cognito endpoint
    - Implement `verify_token()` to validate signature, expiry, issuer, and sub claim extraction
    - Create `get_current_user` FastAPI dependency that extracts Bearer token and returns user_id
    - Return 401 for missing/expired/malformed/tampered tokens
    - Add environment variables: `COGNITO_USER_POOL_ID`, `COGNITO_CLIENT_ID`, `COGNITO_REGION`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 1.5 Write property test for JWT verification (Property 2)
    - **Property 2: JWT Verification Correctness**
    - Use `hypothesis` + `PyJWT` to generate valid/invalid/expired tokens and verify accept/reject behavior
    - **Validates: Requirements 3.1, 3.3, 3.4, 3.5**

- [x] 2. Backend auth routes
  - [x] 2.1 Implement auth router (`src/auth.py`)
    - `POST /auth/register`: call Cognito `sign_up`, handle duplicate email (409), password policy violation (400)
    - `POST /auth/verify`: call Cognito `confirm_sign_up`, handle invalid/expired code (400)
    - `POST /auth/login`: call Cognito `initiate_auth` with `USER_PASSWORD_AUTH`, return tokens (200), invalid credentials (401), unverified (403)
    - `POST /auth/refresh`: call Cognito `initiate_auth` with `REFRESH_TOKEN_AUTH`, return new tokens (200), invalid refresh (401)
    - `POST /auth/logout`: call Cognito `global_sign_out`, requires authentication
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 8.3_

  - [x] 2.2 Write unit tests for auth router
    - Test registration: duplicate email → 409, valid registration → 201
    - Test verification: invalid code → 400, expired code → 400, valid code → 200
    - Test login: invalid credentials → 401, unverified → 403, success → tokens
    - Test refresh: expired refresh → 401, valid refresh → new tokens
    - Test logout: calls Cognito global_sign_out
    - Use mocked Cognito client (boto3)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 3. Backend per-user conversation storage
  - [x] 3.1 Update storage layer for per-user conversation isolation (`src/storage.py`)
    - Modify `_key()` to build paths as `conversations/{user_id}/{conversation_id}.json`
    - Update `list_conversations(user_id)` to list only the user's prefix
    - Update `load_conversation(user_id, conversation_id)` to scope to user
    - Update `save_conversation(user_id, conversation_id, ...)` to scope to user
    - Update `delete_conversation(user_id, conversation_id)` to scope to user
    - Validate `conversation_id` format (alphanumeric, 8 chars) to prevent S3 path traversal
    - _Requirements: 4.1, 4.2, 4.3, 4.5_

  - [x] 3.2 Write property test for conversation isolation (Property 3)
    - **Property 3: Conversation Isolation**
    - Use `hypothesis` to generate multiple users with conversations and verify isolation guarantees
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5**

  - [x] 3.3 Update protected routes to use auth middleware and user_id
    - Add `user_id: str = Depends(get_current_user)` to all conversation route handlers
    - Pass `user_id` to storage layer calls
    - Return 403 if conversation does not belong to requesting user
    - Ensure public routes (health, auth endpoints, /tools) remain unauthenticated
    - _Requirements: 3.5, 3.6, 4.3, 4.4_

- [x] 4. Backend user settings
  - [x] 4.1 Implement settings router (`src/settings.py`)
    - `GET /settings`: retrieve settings from S3 at `settings/{user_id}.json`, return defaults if not found
    - `PUT /settings`: validate input, store to S3, return updated settings
    - Default settings: display_name from email, theme "dark", language "en"
    - Return 400 for invalid field values with field-level error messages
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 4.2 Write property test for settings round-trip (Property 4)
    - **Property 4: Settings Round-Trip Preservation**
    - Use `hypothesis` to generate valid settings, save then load, verify equality
    - **Validates: Requirements 5.1, 5.2**

- [x] 5. Backend migration endpoint
  - [x] 5.1 Implement migration endpoint (`src/migration.py`)
    - `POST /admin/migrate-conversations`: move `conversations/{id}.json` to `conversations/{admin_user_id}/{id}.json`
    - Preserve all message content, titles, and timestamps
    - Idempotent: return 200 if already migrated
    - Requires authentication (admin user)
    - _Requirements: 9.1, 9.2, 9.3_

  - [x] 5.2 Write property test for migration data preservation (Property 10)
    - **Property 10: Migration Data Preservation**
    - Use `hypothesis` to generate random conversation objects, migrate, verify content identical
    - **Validates: Requirements 9.2**

- [x] 6. Backend wiring and server updates
  - [x] 6.1 Wire all routers into the FastAPI server (`server.py`)
    - Register auth router with `/auth` prefix
    - Register settings router with `/settings` prefix
    - Register migration router with `/admin` prefix
    - Update CORS configuration to restrict origins (replace `allow_origins=["*"]`)
    - Add new environment variables to `.env.example`
    - Add dependencies to `requirements.txt`: `PyJWT==2.9.0`, `cryptography==44.0.0`, `httpx==0.28.0`
    - _Requirements: 3.6_

- [x] 7. Checkpoint - Backend complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Frontend auth types and API layer
  - [x] 8.1 Create auth types (`src/lib/types.ts`)
    - Define `User`, `TokenResponse`, `RegisterResponse`, `UserSettings`, `UserSettingsUpdate` interfaces
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 8.2 Implement auth API functions (`src/lib/api.ts`)
    - Add `api.register(email, password)`, `api.verify(email, code)`, `api.login(email, password)`, `api.refresh(refreshToken)`, `api.logout()`
    - Add `api.getSettings()`, `api.updateSettings(settings)`
    - Modify `request()` to attach `Authorization: Bearer <access_token>` header to all protected requests
    - Add 401 response interceptor: attempt refresh, retry request, or redirect to /login on failure
    - _Requirements: 7.2, 7.3, 7.4_

  - [x] 8.3 Write property test for bearer token attachment (Property 9)
    - **Property 9: Bearer Token Attachment**
    - Use `fast-check` to generate random endpoint paths and tokens, verify Authorization header format
    - **Validates: Requirements 7.2**

- [x] 9. Frontend AuthProvider and route protection
  - [x] 9.1 Implement AuthProvider context (`src/lib/AuthContext.tsx`)
    - Create `AuthContext` with `AuthState` and `AuthContextType`
    - Implement `login()`: call api.login, store tokens in localStorage, update state
    - Implement `register()`: call api.register, return `{ needsVerification: true }`
    - Implement `verify()`: call api.verify
    - Implement `logout()`: call api.logout, clear localStorage tokens, redirect to /login
    - Implement `refreshToken()`: call api.refresh, update stored tokens
    - On mount: check localStorage for existing tokens, validate, restore session
    - _Requirements: 7.1, 7.3, 7.4, 7.5, 8.2_

  - [x] 9.2 Write property test for token storage round-trip (Property 8)
    - **Property 8: Token Storage Round-Trip**
    - Use `fast-check` to generate random token strings, verify localStorage persistence round-trip
    - **Validates: Requirements 7.1**

  - [x] 9.3 Implement ProtectedRoute component (`src/components/ProtectedRoute.tsx`)
    - If not authenticated, redirect to `/login`
    - If authenticated, render children
    - Show loading state while checking auth
    - _Requirements: 6.4_

  - [x] 9.4 Write property test for protected route redirect (Property 6)
    - **Property 6: Protected Route Redirect**
    - Use `fast-check` to test all protected routes redirect unauthenticated users to /login
    - **Validates: Requirements 6.4**

  - [x] 9.5 Write property test for auth page redirect (Property 7)
    - **Property 7: Auth Page Redirect for Authenticated Users**
    - Use `fast-check` to verify authenticated users are redirected away from auth pages
    - **Validates: Requirements 6.5**

- [x] 10. Frontend auth pages
  - [x] 10.1 Implement LoginPage (`src/app/login/page.tsx`)
    - Email input, password input, submit button
    - Call `AuthContext.login()` on submit
    - Display inline validation errors below fields
    - Redirect authenticated users to main chat interface
    - Link to registration page
    - _Requirements: 6.1, 6.5, 6.6, 6.7_

  - [x] 10.2 Implement RegisterPage (`src/app/register/page.tsx`)
    - Email input, password input, password confirmation input, submit button
    - Validate password confirmation match client-side
    - Call `AuthContext.register()` on submit
    - Redirect to verification page on success
    - Display inline validation errors below fields
    - Link to login page
    - _Requirements: 6.2, 6.5, 6.6, 6.7_

  - [x] 10.3 Implement VerifyPage (`src/app/verify/page.tsx`)
    - Code input field (6 digits), submit button
    - Call `AuthContext.verify()` on submit
    - Redirect to login page on success
    - Display error message for invalid/expired codes
    - _Requirements: 6.3, 6.6, 6.7_

  - [x] 10.4 Write unit tests for auth pages
    - Test LoginPage renders email, password, submit button
    - Test RegisterPage renders email, password, confirm, submit button
    - Test VerifyPage renders code input
    - Test error messages displayed inline on validation failure
    - Use vitest + React Testing Library
    - _Requirements: 6.1, 6.2, 6.3, 6.6, 6.7_

- [x] 11. Frontend logout and layout integration
  - [x] 11.1 Add logout button and wire AuthProvider into app layout
    - Add logout button accessible from the main chat interface (visible when authenticated)
    - Wrap application in `AuthProvider` in `src/app/layout.tsx`
    - Wrap chat pages with `ProtectedRoute` component
    - Redirect to /login on logout
    - _Requirements: 8.1, 8.2, 8.4_

  - [x] 11.2 Write unit tests for logout flow
    - Test logout button visible when authenticated
    - Test logout clears localStorage and redirects to /login
    - Use vitest + React Testing Library
    - _Requirements: 8.1, 8.2, 8.4_

- [x] 12. Frontend settings page
  - [x] 12.1 Implement settings UI (`src/app/settings/page.tsx`)
    - Display current user settings (display name, theme, language)
    - Form to update settings with validation
    - Call `api.updateSettings()` on submit
    - Show success/error feedback
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 13. Install frontend testing dependencies
  - [x] 13.1 Add testing libraries to package.json
    - Add `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `fast-check` as devDependencies
    - Add `jsdom` for vitest browser environment
    - Create `vitest.config.ts` configuration file
    - _Requirements: testing infrastructure_

- [x] 14. Final checkpoint - Full stack complete
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- Backend tasks (1-7) should be completed before frontend tasks (8-14) since the frontend depends on API endpoints
- The backend uses Python with FastAPI, pytest, and hypothesis for testing
- The frontend uses TypeScript with Next.js, vitest, React Testing Library, and fast-check for testing

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "8.1", "13.1"] },
    { "id": 1, "tasks": ["1.2", "1.3", "1.4", "8.2"] },
    { "id": 2, "tasks": ["1.5", "2.1", "3.1", "4.1", "5.1", "8.3", "9.1"] },
    { "id": 3, "tasks": ["2.2", "3.2", "3.3", "4.2", "5.2", "9.2", "9.3"] },
    { "id": 4, "tasks": ["6.1", "9.4", "9.5", "10.1", "10.2", "10.3"] },
    { "id": 5, "tasks": ["10.4", "11.1", "12.1"] },
    { "id": 6, "tasks": ["11.2"] }
  ]
}
```
forward-logs-shared.ts:95 Download the React DevTools for a better development experience: https://react.dev/link/react-devtools
forward-logs-shared.ts:95 [HMR] connected
13.48.126.141:8000/auth/register:1  Failed to load resource: net::ERR_CONNECTION_TIMED_OUT
intercept-console-error.ts:48 Fetch request failed: TypeError: Failed to fetch
    at window.fetch (inspector.js:7:3144)
    at requestPublic (api.ts:137:21)
    at Object.register (api.ts:165:12)
    at AuthProvider.useCallback[register] (AuthContext.tsx:95:15)
    at handleSubmit (page.tsx:39:28)
    at executeDispatch (react-dom-client.development.js:20610:9)
    at runWithFiberInDEV (react-dom-client.development.js:986:30)
    at processDispatchQueue (react-dom-client.development.js:20660:19)
    at react-dom-client.development.js:21234:9
    at batchedUpdates$1 (react-dom-client.development.js:3377:40)
    at dispatchEventForPluginEventSystem (react-dom-client.development.js:20814:7)
    at dispatchEvent (react-dom-client.development.js:25817:11)
    at dispatchDiscreteEvent (react-dom-client.development.js:25785:11)
error @ intercept-console-error.ts:48
