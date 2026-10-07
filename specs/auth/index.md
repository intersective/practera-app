# Auth Flows

<!-- module: app-v3/auth / type: page / status: draft / feature: deliver.auth.app-direct-login, deliver.auth.app-global-login, deliver.auth.app-login, deliver.auth.app-logout, deliver.auth.app-password-reset, deliver.auth.app-registration, deliver.auth.terms -->

## Overview

The practera-app supports multiple authentication pathways: JWT token handoff (primary), direct login (email/password), global login, registration, password reset, and logout. The primary flow is JWT handoff from practera-login-app via `?token=` query parameter (auth-jwt-login). Auth state is stored in BrowserStorageService.

## Acceptance Criteria

- **AC1**: JWT-based login (`/auth/jwt-login?token=JWT`) decodes and stores the JWT; navigates to home.
- **AC2**: Email/password login (`auth-login`) authenticates via GraphQL and stores the resulting JWT.
- **AC3**: Registration (`auth-registration`) creates a new learner account.
- **AC4**: Forgot password (`auth-forgot-password`) sends a password reset email.
- **AC5**: Reset password (`auth-reset-password`) allows setting a new password via a token link.
- **AC6**: Logout (`auth-logout`) clears stored auth state and navigates to login.
- **AC7**: Direct login (`auth-direct-login`) supports magic-link style auth.
- **AC8**: Global login (`auth-global-login`) supports cross-experience login.

## Scenarios

### Scenario 1: JWT Handoff Login
**Steps:**
1. Login-app redirects to `practera-app/auth/jwt-login?token=JWT`.
2. App decodes JWT and stores in BrowserStorageService.
3. Navigates to home page.

**Expected Results:**
- Auth state set; home page loads for the learner's experience.
- Token stripped from URL after storage.

### Scenario 2: Email/Password Login
**Steps:**
1. Learner enters email and password on auth-login page.
2. Submits form.
3. GraphQL mutation authenticates; JWT returned.

**Expected Results:**
- JWT stored; learner redirected to home.
- Invalid credentials shows an error message.

### Scenario 3: Logout
**Steps:**
1. Learner navigates to logout.

**Expected Results:**
- Auth state cleared from storage.
- Learner redirected to login page.
