// Run: node --test scripts/oauth-pkce-failures.test.cjs
// Executes the real TypeScript service and guard in a fresh browser-like VM per test.
// Only browser/network boundaries and Angular's decorator are substituted.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { webcrypto } = require('node:crypto');
const ts = require('typescript');
const PROJECT_ROOT = path.resolve(__dirname, '..');
const PKCE_STORAGE_KEY = 'oauth_pkce';
const APP_ORIGIN = 'https://app.example.test';

/** Load actual application code without starting Angular or a browser. */
function loadTypeScriptModule(relativePath, context, environment) {
  const source = readFileSync(path.join(PROJECT_ROOT, relativePath), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      experimentalDecorators: true,
    },
  });

  function resolveDependency(id) {
    if (id === '@v3/environments/environment') {
      return { environment };
    }
    if (id === '@angular/core') {
      return { Injectable: () => target => target };
    }
    throw new Error(`Unexpected runtime dependency: ${id}`);
  }

  const module = { exports: {} };
  const evaluateModule = vm.runInContext(
    `(function(require, module, exports) {\n${outputText}\n})`,
    context,
    { filename: relativePath },
  );
  evaluateModule(resolveDependency, module, module.exports);
  return module.exports;
}

function jsonResponse(ok, body) {
  return { ok, json: async () => body };
}

/** Each test gets fresh storage and fresh module-level PKCE promises. */
function createOAuthHarness() {
  const storage = new Map();
  const authorizationRedirects = [];
  const loginRedirects = [];
  const tokenRequests = [];
  const environment = {
    demo: false,
    stackUuid: 'test-stack',
    globalLoginUrl: 'https://login.example.test',
    loginApiUrl: 'https://api.example.test',
  };

  const sessionStorage = {
    getItem: key => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: key => storage.delete(key),
  };
  const crypto = {
    getRandomValues: bytes => webcrypto.getRandomValues(bytes),
    subtle: {
      digest: (...args) => webcrypto.subtle.digest(...args),
    },
  };
  const window = {
    location: {
      origin: APP_ORIGIN,
      hostname: 'app.example.test',
      search: '',
      assign: url => authorizationRedirects.push(url),
    },
  };

  let tokenResponse = async () => jsonResponse(true, { access_token: 'test-token' });
  const context = vm.createContext({
    window,
    sessionStorage,
    crypto,
    URL,
    URLSearchParams,
    TextEncoder,
    Uint8Array,
    btoa,
    console,
    fetch: (...args) => {
      tokenRequests.push(args);
      return tokenResponse(...args);
    },
  });

  const oauthService = loadTypeScriptModule(
    'projects/v3/src/app/services/oauth-pkce.ts', context, environment,
  );
  const { UnauthorizedGuard } = loadTypeScriptModule(
    'projects/v3/src/app/guards/unauthorized.guard.ts', context, environment,
  );
  const guard = new UnauthorizedGuard(
    { isAuthenticated: () => false },
    { navigate() {} },
    { openUrl: url => loginRedirects.push(url) },
  );

  return {
    ...oauthService,
    storage,
    crypto,
    authorizationRedirects,
    loginRedirects,
    tokenRequests,
    setTokenResponse(response) {
      tokenResponse = response;
    },
    storeAuthorizationAttempt(state) {
      storage.set(PKCE_STORAGE_KEY, JSON.stringify({
        verifier: 'test-verifier',
        state,
        redirectUri: `${APP_ORIGIN}/`,
      }));
    },
    visitLoginRoute() {
      return guard.canActivate({}, { url: '/auth/login' });
    },
  };
}

test('concurrent starts share one attempt and preserve its verifier', async () => {
  const app = createOAuthHarness();
  const first = app.beginAuthorizationCode({ stackUuid: 'test-stack' });
  const second = app.beginAuthorizationCode({ stackUuid: 'test-stack' });
  assert.equal(first, second);

  app.visitLoginRoute();
  assert.equal(app.loginRedirects.length, 0, 'active start must not be interrupted');
  await first;
  assert.equal(app.authorizationRedirects.length, 1);
  assert.ok(JSON.parse(app.storage.get(PKCE_STORAGE_KEY)).verifier);
});

test('concurrent callbacks perform one token exchange', async () => {
  const app = createOAuthHarness();
  app.storeAuthorizationAttempt('state-1');
  const first = app.exchangeAuthorizationCode('code-1', 'state-1');
  const second = app.exchangeAuthorizationCode('code-1', 'state-1');
  assert.equal(first, second);
  assert.equal(await first, 'test-token');
  assert.equal(app.tokenRequests.length, 1);
  assert.equal(app.storage.has(PKCE_STORAGE_KEY), false);
});

test('mismatched state rejects before contacting token endpoint', async () => {
  const app = createOAuthHarness();
  app.storeAuthorizationAttempt('expected');

  await assert.rejects(app.exchangeAuthorizationCode('code', 'wrong'), /state mismatch/);
  assert.equal(app.tokenRequests.length, 0);
  assert.equal(app.storage.has(PKCE_STORAGE_KEY), false);
});

test('HTTP token failure clears pending state and permits login redirect', async () => {
  const app = createOAuthHarness();
  app.storeAuthorizationAttempt('state');
  app.setTokenResponse(async () => jsonResponse(false, { error_description: 'Code expired' }));

  await assert.rejects(app.exchangeAuthorizationCode('code', 'state'), /Code expired/);

  app.visitLoginRoute();
  assert.equal(app.loginRedirects.length, 1);
});

test('digest failure clears pending marker so a later clean login route can recover', async () => {
  const app = createOAuthHarness();
  app.crypto.subtle.digest = async () => {
    throw new Error('Digest unavailable');
  };

  await assert.rejects(app.beginAuthorizationCode({ stackUuid: 'test-stack' }), /Digest unavailable/);

  app.visitLoginRoute();
  assert.equal(app.loginRedirects.length, 1, 'failed start must not indefinitely suppress login');
});

test('network failure clears pending state so a clean login route can recover', async () => {
  const app = createOAuthHarness();
  app.storeAuthorizationAttempt('state');
  app.setTokenResponse(async () => {
    throw new TypeError('Network unavailable');
  });

  await assert.rejects(app.exchangeAuthorizationCode('code', 'state'), /Network unavailable/);

  app.visitLoginRoute();
  assert.equal(app.loginRedirects.length, 1, 'failed exchange must not indefinitely suppress login');
});

test('a fresh authorization attempt can exchange after an earlier rejected attempt in the same document', async () => {
  const app = createOAuthHarness();
  app.storeAuthorizationAttempt('state-1');
  app.setTokenResponse(async () => jsonResponse(false, { error_description: 'Code expired' }));

  await assert.rejects(app.exchangeAuthorizationCode('code-1', 'state-1'), /Code expired/);

  app.storeAuthorizationAttempt('state-2');
  app.setTokenResponse(async () => jsonResponse(true, { access_token: 'fresh-token' }));
  assert.equal(await app.exchangeAuthorizationCode('code-2', 'state-2'), 'fresh-token');
  assert.equal(app.tokenRequests.length, 2, 'a fresh code must not reuse an old rejected promise');
});

test('malformed stored state cannot strand a user on a clean login route', () => {
  const app = createOAuthHarness();
  app.storage.set(PKCE_STORAGE_KEY, '{broken-json');

  app.visitLoginRoute();
  assert.equal(app.loginRedirects.length, 1, 'corrupt storage is not evidence of an active exchange');
});

test('an abandoned pending marker from a previous document does not suppress login forever', () => {
  const app = createOAuthHarness();
  app.storage.set(PKCE_STORAGE_KEY, JSON.stringify({ pending: true, stackUuid: 'test-stack' }));

  app.visitLoginRoute();
  assert.equal(app.loginRedirects.length, 1, 'no OAuth URL or active start exists in this document');
});
