# Requirements Document

## Introduction

This document specifies the requirements for adding user authentication to the Cody AI Agent application using AWS Cognito. Currently, the application has no authentication and all users share a single global conversation pool stored in S3. This feature introduces user registration, login, per-user conversation isolation, user preferences, and protected API routes so that each user has a private, personalized experience.

## Glossary

- **Cognito_User_Pool**: The AWS Cognito User Pool that manages user identities, registration, and authentication for the Cody application
- **JWT**: A JSON Web Token issued by the Cognito_User_Pool upon successful authentication, used to authorize API requests
- **Access_Token**: The JWT issued by Cognito that grants access to protected API endpoints
- **ID_Token**: The JWT issued by Cognito that contains user identity claims (email, name, sub)
- **Refresh_Token**: A long-lived token used to obtain new Access_Tokens without re-authentication
- **Auth_Middleware**: The FastAPI middleware component that validates JWTs on protected API routes
- **Auth_Provider**: The React context provider in the frontend that manages authentication state, tokens, and user session
- **User_Settings**: A JSON object stored in S3 containing per-user preferences (display name, theme, language)
- **Conversation_Store**: The S3 storage layer that persists conversation data, keyed by user ID and conversation ID
- **API_Server**: The FastAPI backend server that exposes REST and SSE endpoints for the Cody AI Agent
- **Frontend_App**: The Next.js application that provides the user interface for the Cody AI Agent
- **Protected_Route**: An API endpoint that requires a valid Access_Token in the Authorization header
- **Public_Route**: An API endpoint accessible without authentication (health check, registration, login)

## Requirements

### Requirement 1: User Registration

**User Story:** As a new user, I want to register an account with my email and password, so that I can have my own private conversations with Cody.

#### Acceptance Criteria

1. WHEN a user submits a valid email and password, THE Cognito_User_Pool SHALL create a new user account and send a verification code to the provided email
2. WHEN a user submits a verification code matching the code sent to their email, THE Cognito_User_Pool SHALL confirm the user account and mark it as verified
3. IF a user submits a registration request with an email already associated with an existing account, THEN THE API_Server SHALL return a 409 Conflict response with an appropriate error message
4. IF a user submits a registration request with a password that does not meet the minimum policy (8 characters, at least one uppercase, one lowercase, one number, one special character), THEN THE API_Server SHALL return a 400 Bad Request response specifying which password rules were violated
5. WHEN a user submits an invalid or expired verification code, THE API_Server SHALL return a 400 Bad Request response indicating the code is invalid or expired

### Requirement 2: User Login

**User Story:** As a registered user, I want to log in with my email and password, so that I can access my conversations and settings.

#### Acceptance Criteria

1. WHEN a user submits valid credentials (email and password), THE API_Server SHALL return an Access_Token, an ID_Token, and a Refresh_Token
2. IF a user submits invalid credentials, THEN THE API_Server SHALL return a 401 Unauthorized response without revealing whether the email or password was incorrect
3. IF a user account is not yet verified, THEN THE API_Server SHALL return a 403 Forbidden response indicating the account requires email verification
4. WHEN a user submits a valid Refresh_Token, THE API_Server SHALL return a new Access_Token and ID_Token without requiring the user to re-enter credentials
5. IF a user submits an expired or invalid Refresh_Token, THEN THE API_Server SHALL return a 401 Unauthorized response requiring re-authentication

### Requirement 3: API Route Protection

**User Story:** As the system owner, I want all conversation and settings endpoints to require authentication, so that unauthorized users cannot access private data.

#### Acceptance Criteria

1. THE Auth_Middleware SHALL validate the Access_Token in the Authorization header of every request to a Protected_Route
2. IF a request to a Protected_Route does not include an Authorization header, THEN THE Auth_Middleware SHALL return a 401 Unauthorized response
3. IF a request to a Protected_Route includes an expired Access_Token, THEN THE Auth_Middleware SHALL return a 401 Unauthorized response with an error indicating token expiration
4. IF a request to a Protected_Route includes a malformed or tampered Access_Token, THEN THE Auth_Middleware SHALL return a 401 Unauthorized response
5. THE Auth_Middleware SHALL extract the user identifier (Cognito sub claim) from the validated Access_Token and make it available to route handlers
6. THE API_Server SHALL allow unauthenticated access to Public_Routes: health check, registration, login, token refresh, and verification endpoints

### Requirement 4: Per-User Conversation Isolation

**User Story:** As an authenticated user, I want to see only my own conversations, so that my chat history remains private and separate from other users.

#### Acceptance Criteria

1. WHEN an authenticated user creates a new conversation, THE Conversation_Store SHALL store the conversation under the path `conversations/{user_id}/{conversation_id}.json` in S3
2. WHEN an authenticated user requests a list of conversations, THE Conversation_Store SHALL return only conversations belonging to that user
3. WHEN an authenticated user requests a specific conversation, THE Conversation_Store SHALL return the conversation only if it belongs to that user
4. IF an authenticated user attempts to access a conversation belonging to another user, THEN THE API_Server SHALL return a 403 Forbidden response
5. WHEN an authenticated user deletes a conversation, THE Conversation_Store SHALL remove the conversation only if it belongs to that user

### Requirement 5: User Settings and Preferences

**User Story:** As an authenticated user, I want to save my preferences (display name, theme, language), so that the application remembers my customizations across sessions.

#### Acceptance Criteria

1. WHEN an authenticated user updates their settings, THE API_Server SHALL store the User_Settings object at `settings/{user_id}.json` in S3
2. WHEN an authenticated user requests their settings, THE API_Server SHALL return the User_Settings object belonging to that user
3. IF an authenticated user requests settings and no User_Settings object exists, THEN THE API_Server SHALL return a default settings object with display name derived from email, theme set to "dark", and language set to "en"
4. THE API_Server SHALL validate User_Settings fields: display name (1-50 characters), theme (one of "light", "dark"), and language (one of "en", "fr", "ar")
5. IF an authenticated user submits invalid User_Settings values, THEN THE API_Server SHALL return a 400 Bad Request response specifying which fields are invalid

### Requirement 6: Frontend Authentication Pages

**User Story:** As a user, I want login and registration pages in the application, so that I can create an account and sign in through the UI.

#### Acceptance Criteria

1. THE Frontend_App SHALL provide a login page with email and password fields and a submit button
2. THE Frontend_App SHALL provide a registration page with email, password, and password confirmation fields and a submit button
3. THE Frontend_App SHALL provide a verification page with a code input field for email confirmation after registration
4. WHEN a user is not authenticated, THE Frontend_App SHALL redirect the user to the login page when they attempt to access a protected page
5. WHEN a user is authenticated, THE Frontend_App SHALL redirect the user away from login and registration pages to the main chat interface
6. THE Frontend_App SHALL display validation errors inline below the relevant form field within 100ms of form submission
7. WHEN authentication fails, THE Frontend_App SHALL display the error message returned by the API_Server without exposing internal details

### Requirement 7: Frontend Token Management

**User Story:** As an authenticated user, I want the application to manage my session tokens automatically, so that I stay logged in without repeated manual authentication.

#### Acceptance Criteria

1. WHEN a user logs in successfully, THE Auth_Provider SHALL store the Access_Token, ID_Token, and Refresh_Token in memory and persist them to localStorage
2. THE Auth_Provider SHALL include the Access_Token in the Authorization header of every request to a Protected_Route
3. WHEN the Access_Token expires, THE Auth_Provider SHALL automatically use the Refresh_Token to obtain a new Access_Token before retrying the failed request
4. IF the Refresh_Token is expired or invalid, THEN THE Auth_Provider SHALL clear all stored tokens and redirect the user to the login page
5. WHEN a user logs out, THE Auth_Provider SHALL clear all stored tokens from memory and localStorage and redirect the user to the login page

### Requirement 8: User Logout

**User Story:** As an authenticated user, I want to log out of the application, so that my session is ended and my account is protected on shared devices.

#### Acceptance Criteria

1. THE Frontend_App SHALL display a logout button accessible from the main interface when a user is authenticated
2. WHEN a user clicks the logout button, THE Auth_Provider SHALL clear all tokens and session data from the client
3. WHEN a user logs out, THE API_Server SHALL invalidate the user session in the Cognito_User_Pool by calling the global sign-out endpoint
4. WHEN a user logs out successfully, THE Frontend_App SHALL redirect the user to the login page

### Requirement 9: Data Migration for Existing Conversations

**User Story:** As the system owner, I want existing conversations to remain accessible after authentication is introduced, so that no data is lost during the transition.

#### Acceptance Criteria

1. THE API_Server SHALL provide a one-time migration endpoint that moves existing conversations from `conversations/{id}.json` to `conversations/{designated_admin_user_id}/{id}.json`
2. WHEN the migration endpoint is called, THE Conversation_Store SHALL preserve all message content, titles, and timestamps of migrated conversations
3. IF the migration has already been completed, THEN THE API_Server SHALL return a 200 OK response indicating no migration was necessary
