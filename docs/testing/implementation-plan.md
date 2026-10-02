# Reliable app testing implementation plan

Approved 2026-10-02 for chaw-login-refactor-e2e.

1. Pin Node 22.23.2 and npm 11.6.2; review lifecycle scripts, clean install, and record unit/lint/build/server baselines.
2. Add Playwright 1.63.0, isolated Angular environments, three browser projects, repository-owned caches and reports, and launcher commands.
3. Implement isolated GraphQL fixtures and critical authentication/program/activity/topic/assessment journeys. Keep demo false and real application services.
4. Validate five retry-free runs, negative fixture proof, relevant unit regressions, and a separate read-only sandbox smoke gate using a supplied token. Live execution is pending at the user's request.
5. Document setup, interfaces, fixture maintenance, evidence and blockers; local testing only, CI and external login UI deferred.

## Acceptance

Clean setup/build/server verified; relevant unit tests pass and full baseline recorded; browser suite passes five times across desktop Chromium, mobile Chromium and mobile WebKit; sandbox smoke passes with dedicated token. Missing live access remains an explicit incomplete acceptance gate.
