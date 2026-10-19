---
id: identity-and-access
kind: capability
title: "Identity & Access Management"
parent: system
value: "Enables secure, flexible authentication so learners can access their personalized learning environment via multiple pathways including JWT token handoff, direct login, and federated identity."
status: active
sources:
  - "projects/v3/src/app/pages/auth/**"
  - "projects/v3/src/app/services/auth.service.ts"
  - "projects/v3/src/app/services/oauth-pkce.ts"
  - "projects/v3/src/app/services/storage.service.ts"
tests:
  - "projects/v3/src/app/pages/auth/**/*.spec.ts"
  - "projects/v3/src/app/services/auth.service.spec.ts"
  - "projects/v3/src/app/services/storage.service.spec.ts"
---

# Identity & Access Management

## Problem & Value

Practera learners need secure, reliable access to their personalized learning environment. Without flexible authentication pathways, learners cannot reach their programs, mentors cannot support them, and administrators cannot manage access. This capability enables learners to authenticate via multiple methods—JWT token handoff from a centralized login portal, direct email/password login, magic links, and federated identity flows—ensuring seamless access regardless of how they arrive at the platform. It also provides password recovery and registration flows so learners are never locked out, while maintaining security through token-based sessions and rate limiting.

The capability reduces friction for learners who may transition between different Practera experiences or access the platform from external systems. By consolidating all authentication concerns—login, logout, registration, password management, and session handling—into a single cohesive module, the system ensures consistent security policies, simplifies troubleshooting, and accelerates feature development across authentication flows.

## Users & Journeys

- A learner clicks a link in an email from Practera's central login portal and is immediately authenticated via JWT token handoff, landing in their personalized dashboard.
- A returning learner enters their email and password on the login page, is authenticated, and proceeds to their active program.
- A learner who forgot their password requests a reset link, receives an email, sets a new password, and logs in successfully.
- A new learner receives a registration invite with a unique link, completes the registration form with their details, and gains access to the platform.
- A learner clicks logout, is signed out, and all session data is cleared from the browser.
- A learner accessing the platform via a partner integration is authenticated through a global login flow using an API key and JWT.

## Requirements

- [ ] When a user navigates to /auth/jwt/:jwt or /auth/jwt with a JWT in sessionStorage, the system decodes the JWT, stores authentication state, and redirects the user to their home page. <!-- claim: jwt-token-handoff-authentication -->
- [ ] When a user submits valid email and password credentials on the login page, the system authenticates via GraphQL, stores the resulting JWT, and navigates to the home page. <!-- claim: email-password-authentication -->
- [ ] When a user navigates to /auth/logout, the system clears all stored authentication state and redirects to the login page. <!-- claim: logout-clears-session -->
- [ ] When a user submits an email address on the forgot password page, the system sends a password reset email containing a link with a unique token. <!-- claim: password-reset-request -->
- [ ] If a user attempts to reset their password more than once within 2 minutes, the system displays an error message instructing them to wait before retrying. <!-- claim: password-reset-rate-limiting -->
- [ ] When a user navigates to /auth/reset_password/:key/:email and submits a new password, the system validates the token and updates the password. <!-- claim: password-reset-completion -->
- [ ] When a user navigates to /auth/registration/:email/:key and submits the registration form, the system creates a new learner account. <!-- claim: learner-registration -->
- [ ] When a user navigates to /auth/secure/:authToken, the system authenticates the user and redirects them to the intended page. <!-- claim: direct-login-via-magic-link -->
- [ ] When a user navigates to /auth/global_login/:apikey, the system authenticates the user via the provided API key and redirects them to the appropriate experience. <!-- claim: global-login-via-apikey -->
- [ ] Unauthenticated users attempting to access login, registration, forgot password, or reset password pages are allowed through; authenticated users are redirected away from these pages. <!-- claim: unauthorized-guard-protection -->
- [ ] When a user views terms and conditions, the system displays a PDF in an embedded iframe with options to agree or cancel. <!-- claim: terms-and-conditions-preview -->
- [ ] The login form requires both email and password fields to be filled before enabling the submit button. <!-- claim: login-form-validation -->
- [ ] On the login and reset password pages, users can toggle password visibility between masked and plain text. <!-- claim: password-visibility-toggle -->
- [ ] The forgot password form requires a valid email address before allowing submission. <!-- claim: forgot-password-email-validation -->
- [ ] Authentication state including JWT tokens is stored in browser storage and persists across page reloads until logout. <!-- claim: authentication-state-persistence -->
- [ ] When a user navigates to /auth/logout with route parameters, the system passes those parameters to the logout method. <!-- claim: logout-with-parameters -->

## Scenarios

### Scenario 1: JWT Handoff Login from Central Portal
**Steps:**
1. User clicks a link from practera-login-app containing ?token=JWT
2. System navigates to /auth/jwt with JWT in sessionStorage
3. Component reads and decodes the JWT
4. System stores authentication state in browser storage

**Expected Results:**
- User is authenticated
- User is redirected to home page
- JWT is stored for subsequent API calls

### Scenario 2: Email and Password Login
**Steps:**
1. User navigates to /auth/login
2. User enters email address and password
3. User clicks LOGIN button
4. System sends authentication request via GraphQL

**Expected Results:**
- System stores returned JWT
- User is redirected to home page
- Form is disabled during submission with 'LOGGING IN...' label

### Scenario 3: Forgot and Reset Password
**Steps:**
1. User navigates to /auth/forgot_password
2. User enters email address and clicks Send Email
3. System sends password reset email with token link
4. User clicks reset link in email navigating to /auth/reset_password/:key/:email
5. User enters new password and submits

**Expected Results:**
- User receives confirmation popup with their email
- Password is updated
- User can log in with new password
- System prevents password reset attempts within 2 minutes of previous attempt

### Scenario 4: New Learner Registration
**Steps:**
1. User receives registration invite email with unique link
2. User clicks link navigating to /auth/registration/:email/:key
3. User completes registration form with required details
4. User submits registration form

**Expected Results:**
- New learner account is created
- User gains access to platform

### Scenario 5: Logout Flow
**Steps:**
1. Authenticated user navigates to /auth/logout
2. System clears stored authentication state

**Expected Results:**
- User session is terminated
- User is redirected to login page
- All auth tokens are removed from browser storage

### Scenario 6: Magic Link Direct Login
**Steps:**
1. User clicks magic link navigating to /auth/secure/:authToken
2. System authenticates using the authToken
3. System redirects to intended destination

**Expected Results:**
- User is authenticated without entering credentials
- User reaches their intended page

### Scenario 7: Global Login from Partner Integration
**Steps:**
1. User accesses platform via partner system
2. Partner redirects to /auth/global_login/:apikey
3. System authenticates using API key
4. System redirects to appropriate experience

**Expected Results:**
- User is authenticated via federated identity
- User lands in correct Practera experience

### Scenario 8: Terms and Conditions Review
**Steps:**
1. User is presented with terms and conditions modal
2. User reviews PDF document in iframe
3. User clicks 'I agree' or 'Cancel'

**Expected Results:**
- Modal displays embedded PDF from https://images.practera.com/terms_and_conditions/practera_terms_conditions.pdf
- Agreement status is returned to calling component
- Modal closes after user response

## Security & Data Considerations

This capability handles all user authentication tokens (JWT), passwords, and session state. Trust boundaries exist between the Angular client and backend GraphQL API, between the app and the central login portal, and between the app and partner integrations. Password reset tokens and registration keys are single-use and time-limited. Rate limiting prevents brute force password reset attempts (2-minute cooldown). Passwords are never logged or displayed in plain text by default. JWTs are stored in browser storage and transmitted to backend APIs for authorization. The UnauthorizedGuard prevents authenticated users from accessing public auth pages. Abuse cases include token replay attacks, brute force password attempts, and session hijacking; these are mitigated by token expiration, rate limiting, and secure storage practices.

## Interfaces

Routes: /auth/login (email/password form), /auth/logout (clears session), /auth/forgot_password (request reset), /auth/reset_password/:key/:email (set new password), /auth/registration/:email/:key (create account), /auth/secure/:authToken (magic link), /auth/global_login/:apikey (federated), /auth/jwt/:jwt (token handoff), /auth/jwt (parameterless token handoff reading from sessionStorage). GraphQL mutations: authentication (email/password login), forgotPassword (send reset email). AuthService methods: login(), logout(), forgotPassword(), resetPassword(), register(). Browser storage keys managed by BrowserStorageService for JWT and session state. TermsConditionsPreviewComponent modal returns {isAgreed: boolean}.

## Out of Scope

This capability does not handle role-based authorization or permission enforcement within the application; those are managed by guards and services in other capabilities. It does not manage multi-factor authentication, biometric login, or social media OAuth providers. It does not define password complexity policies, though it accepts whatever the backend enforces. The capability does not manage session timeout or token refresh logic. It does not handle onboarding flows, user profile setup, or program enrollment after authentication. Email delivery infrastructure and template content for password reset and registration emails are out of scope.
