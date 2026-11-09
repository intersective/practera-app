/**
 * Public OAuth 2.0 client (Authorization Code + PKCE, RFC 7636) for login-api.
 * The only value that appears in this app's URL is a single-use authorization code.
 */
import { environment } from '@v3/environments/environment';

const CLIENT_ID = 'practera-app';
const STORE_KEY = 'oauth_pkce';

export function loginApiBase(): string {
  const env = environment as { loginApiUrl?: string; loginAPIUrl?: string };
  const configured = env.loginApiUrl || env.loginAPIUrl;
  if (configured) return configured.replace(/\/$/, '');
  try {
    const u = new URL(environment.globalLoginUrl);
    if (u.hostname.startsWith('login-app.')) {
      u.hostname = u.hostname.replace(/^login-app\./, 'login-api.');
      return u.origin;
    }
    if (u.hostname.startsWith('login.')) {
      u.hostname = 'api.' + u.hostname.slice('login.'.length);
      return u.origin;
    }
  } catch {
    /* fall through */
  }
  return 'https://api.practera.local';
}

function base64url(bytes: Uint8Array): string {
  let binary = '';
  bytes.forEach((b) => { binary += String.fromCharCode(b); });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function randomVerifier(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return base64url(bytes);
}

async function s256(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return base64url(new Uint8Array(digest));
}

/** Query keys that choose a page after login. They stay in this browser; login-api does not echo them. */
export const OAUTH_DESTINATION_KEYS = [
  'redirect',
  'tl',
  'act',
  'ctxt',
  'asmt',
  'sm',
  'top',
  'evt',
  'experienceUuid',
  'brandColor',
  'brandLogo',
  'one_page_only',
  'return_url',
  'activity_task_referrer_url',
  'assessment_referrer_url',
] as const;

export function destinationFromSearchParams(params: URLSearchParams): Record<string, string> {
  const destination: Record<string, string> = {};
  for (const key of OAUTH_DESTINATION_KEYS) {
    const value = params.get(key);
    if (value) destination[key] = value;
  }
  return destination;
}

export interface PkceStart {
  stackUuid: string;
  email?: string;
  redirect?: string;
  experienceUuid?: string;
  brandColor?: string;
  brandLogo?: string;
  /** Opaque magic-link token for this tab. Not stored, and not a page target. */
  magicToken?: string;
  /** Page target copied from the ?oauth=1 URL. Returned with the access token. */
  destination?: Record<string, string>;
}

export interface ExchangedAuthorizationCode {
  accessToken: string;
  destination: Record<string, string>;
}

/** The login guard can run while this is still starting. A second call must not replace the verifier. */
let authorizationStart: Promise<void> | null = null;

/** Leave this origin for login-api /oauth2/authorize. Verifier stays in sessionStorage. */
export function beginAuthorizationCode(start: PkceStart): Promise<void> {
  if (authorizationStart) return authorizationStart;
  authorizationStart = startAuthorizationCode(start).catch((err) => {
    authorizationStart = null;
    throw err;
  });
  return authorizationStart;
}

async function startAuthorizationCode(start: PkceStart): Promise<void> {
  const { magicToken, ...stored } = start;
  // Marker first, so the login guard can see the handoff before the digest finishes.
  sessionStorage.setItem(STORE_KEY, JSON.stringify({ pending: true, ...stored }));
  const verifier = randomVerifier();
  const state = randomVerifier();
  const challenge = await s256(verifier);
  const redirectUri = `${window.location.origin}/`;
  sessionStorage.setItem(STORE_KEY, JSON.stringify({ verifier, state, redirectUri, ...stored }));

  const url = new URL(`${loginApiBase()}/oauth2/authorize`);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', CLIENT_ID);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('code_challenge', challenge);
  url.searchParams.set('code_challenge_method', 'S256');
  url.searchParams.set('state', state);
  url.searchParams.set('stack_uuid', start.stackUuid);
  if (start.email) url.searchParams.set('email', start.email);
  if (start.redirect) url.searchParams.set('redirect', start.redirect);
  if (start.experienceUuid) url.searchParams.set('experienceUuid', start.experienceUuid);
  if (start.brandColor) url.searchParams.set('brandColor', start.brandColor);
  if (start.brandLogo) url.searchParams.set('brandLogo', start.brandLogo);
  if (magicToken) {
    try {
      const cleaned = new URL(window.location.href);
      cleaned.searchParams.delete('magic_token');
      history.replaceState(null, '', `${cleaned.pathname}${cleaned.search}${cleaned.hash}`);
    } catch { /* keep going; the token is still only on this authorize request */ }
    url.searchParams.set('magic_token', magicToken);
  }
  window.location.assign(url.toString());
}

function readDestination(stored: { destination?: unknown }): Record<string, string> {
  const raw = stored.destination;
  if (!raw || typeof raw !== 'object') return {};
  const destination: Record<string, string> = {};
  const source = raw as Record<string, unknown>;
  for (const key of OAUTH_DESTINATION_KEYS) {
    const value = source[key];
    if (typeof value === 'string' && value) destination[key] = value;
  }
  return destination;
}

/**
 * Trade ?code= for an access token. Returns the token and the page target saved
 * before the browser left for login-api, or null when this page load is not a callback.
 */
let authorizationExchange: Promise<ExchangedAuthorizationCode | null> | null = null;

export function exchangeAuthorizationCode(
  code: string,
  state: string | null,
): Promise<ExchangedAuthorizationCode | null> {
  if (authorizationExchange) return authorizationExchange;
  authorizationExchange = exchangeOnce(code, state);
  return authorizationExchange;
}

async function exchangeOnce(code: string, state: string | null): Promise<ExchangedAuthorizationCode | null> {
  const raw = sessionStorage.getItem(STORE_KEY);
  if (!raw || !code) return null;
  const stored = JSON.parse(raw) as { verifier?: string; state?: string; redirectUri?: string; destination?: unknown };
  if (!stored.verifier) return null;
  if (!state || stored.state !== state) {
    sessionStorage.removeItem(STORE_KEY);
    throw new Error('OAuth state mismatch');
  }
  const destination = readDestination(stored);
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    code_verifier: stored.verifier,
    client_id: CLIENT_ID,
    redirect_uri: stored.redirectUri,
  });
  const res = await fetch(`${loginApiBase()}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const json = await res.json().catch(() => ({}));
  sessionStorage.removeItem(STORE_KEY);
  if (!res.ok || !json.access_token) {
    throw new Error(json.error_description || 'Token request failed');
  }
  return { accessToken: json.access_token as string, destination };
}
